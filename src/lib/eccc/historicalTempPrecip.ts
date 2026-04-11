import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import axios from "lib/backendAxios";
import { formatFetchError, looksLikeClimatedataXml } from "lib/eccc/fetchErrors";
import { ElementCompact, xml2js } from "xml-js";
import {
  HistoricalDataStats,
  HistoricalPrecipData,
  HistoricalTemperatureAlmanac,
  LastMonthDayValue,
  LastMonthSummary,
} from "types";
import { isSameMonth, isValid, isYesterday, parseISO, subMonths } from "date-fns";
import { isDateInCurrentWinterSeason, getIsWinterSeason, isDateInCurrentSummerSeason } from "lib/date";
import eventbus from "lib/eventbus";
import { EVENT_BUS_CONFIG_CHANGE_HISTORICAL_TEMP_PRECIP } from "consts";

function xmlText(el: unknown): string | undefined {
  if (el == null) return undefined;
  if (typeof el === "string" || typeof el === "number") return String(el).trim();
  const o = el as { _text?: string | number };
  if (o._text !== undefined && o._text !== null) return String(o._text).trim();
  return undefined;
}

/**
 * ECCC bulk row: mm liquid equivalent — prefer `totalprecipitation`, else `totalrain`.
 * Trace / missing → 0 so seasonal **numeric totals** stay well-defined (province yesterday UI still shows
 * literal TRACE/MISSING from citypage elsewhere).
 */
function dailyPrecipitationMm(row: { totalprecipitation?: unknown; totalrain?: unknown }): number {
  const raw = xmlText(row.totalprecipitation) ?? xmlText(row.totalrain);
  if (raw == null || raw === "") return 0;
  const u = raw.toUpperCase();
  if (u === "T" || u === "M") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function dailySnowCm(row: { totalsnow?: unknown }): number {
  const raw = xmlText(row.totalsnow);
  if (raw == null || raw === "") return 0;
  const u = raw.toUpperCase();
  if (u === "T" || u === "M") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

const logger = new Logger("Historical_Temp_Precip");
const config = initializeConfig();

class HistoricalTempPrecip {
  private _apiURL: string;
  private _historicalData: any[] = [];
  private _fetchBusy = false;
  private _fetchPendingDate: Date | null = null;

  private _lastYearTemperatures: HistoricalTemperatureAlmanac = { min: null, max: null };
  private _seasonPrecipData: HistoricalPrecipData = { amount: 0, normal: 0, unit: "mm", type: "rain" };
  private _yesterdayPrecipData: HistoricalPrecipData = { amount: null, normal: 0, unit: "mm", type: "rain" };
  private _yesterdaySnowData: HistoricalPrecipData = { amount: null, normal: 0, unit: "cm", type: "snow" };
  private _lastMonthSummary: LastMonthSummary = null;

  constructor() {
    if (!config) return;

    this.initialize();
    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_HISTORICAL_TEMP_PRECIP, () => this.initialize());
  }

  private initialize() {
    logger.log("Initializing historical data for station ID:", config.historicalDataStationID);
    // ECCC now returns HTML unless Month/Day anchor the request (timeframe=2 = annual daily).
    this._apiURL = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=${config.historicalDataStationID}&Year=$YEAR&Month=1&Day=1&timeframe=2`;
  }

  public fetchLastTwoYearsOfData(currentDate: Date = new Date()) {
    if (this._fetchBusy) {
      this._fetchPendingDate = currentDate;
      return;
    }
    this._fetchBusy = true;

    const currentYear = currentDate.getFullYear();
    const yearsToFetch = [currentYear - 1, currentYear];
    logger.log("Preparing to fetch historical data for years", yearsToFetch.join());

    this._historicalData.splice(0, this._historicalData.length);

    const promises: Promise<any>[] = [];
    yearsToFetch.forEach((year) => {
      logger.log("Fetching historical data for", year);

      promises.push(
        axios
          .get(this._apiURL.replace("$YEAR", year.toString()), { responseType: "text" })
          .then((resp) => {
            const { data } = resp ?? {};
            if (!data?.length) throw new Error("empty body");

            const raw = typeof data === "string" ? data : String(data);
            if (!looksLikeClimatedataXml(raw)) {
              throw new Error("response is not climatedata XML (check station ID / ECCC availability)");
            }

            let historicalDataAsJSObject: ElementCompact;
            try {
              historicalDataAsJSObject = xml2js(raw, { compact: true }) as ElementCompact;
            } catch (parseErr) {
              throw new Error(`XML parse failed: ${formatFetchError(parseErr)}`);
            }
            if (!historicalDataAsJSObject) throw new Error("Unable to convert to JS object");

            const climateData = historicalDataAsJSObject["climatedata"];
            if (!climateData) throw new Error("No climate data root");

            const stationData = climateData["stationdata"];
            if (!stationData) throw new Error("No station data");

            const rows = Array.isArray(stationData) ? stationData : [stationData];
            this._historicalData.push(...rows);

            logger.log("Fetched historical data for", year);
          })
          .catch((err) =>
            logger.warn(`Historical bulk data for ${year} skipped: ${formatFetchError(err)}`)
          )
      );
    });

    Promise.allSettled(promises).then(() => {
      this.parseHistoricalStationData(currentDate);
      this._fetchBusy = false;
      if (this._fetchPendingDate) {
        const next = this._fetchPendingDate;
        this._fetchPendingDate = null;
        this.fetchLastTwoYearsOfData(next);
      }
    });
  }

  private parseHistoricalStationData(currentDate: Date) {
    this.parseLastYearTemperatures(currentDate);
    this.parseSeasonalPrecip(currentDate);
  }

  private parseLastYearTemperatures(currentDate: Date) {
    if (!this._historicalData?.length) return;

    if (!isValid(currentDate)) return;

    const todayLastYear = this._historicalData.find(
      (stationData) =>
        Number(stationData._attributes.day) === currentDate.getDate() &&
        Number(stationData._attributes.month) === currentDate.getMonth() + 1 &&
        Number(stationData._attributes.year) === currentDate.getFullYear() - 1
    );
    if (!todayLastYear) return;

    const maxV = Number(xmlText(todayLastYear.maxtemp) ?? NaN);
    const minV = Number(xmlText(todayLastYear.mintemp) ?? NaN);
    this._lastYearTemperatures.max = Number.isFinite(maxV) ? { value: maxV, unit: "C" } : null;
    this._lastYearTemperatures.min = Number.isFinite(minV) ? { value: minV, unit: "C" } : null;
  }

  private parseSeasonalPrecip(currentDate: Date) {
    if (!this._historicalData?.length) return;

    if (!isValid(currentDate)) return;

    logger.log("Calculating precip data for the season/yesterday");

    const lastMonthData: HistoricalDataStats = [];
    const lastMonth = subMonths(currentDate, 1);

    const isWinterSeason = getIsWinterSeason(currentDate.getMonth() + 1);
    let rainfall = 0;
    let winterSnowCm = 0;
    let yesterdayRainfall = 0;
    let yesterdaySnowfall = 0;
    this._historicalData?.forEach((historicalData) => {
      if (!historicalData?._attributes) return;

      const {
        _attributes: { year, month, day },
      } = historicalData;

      const y = String(year);
      const m = String(month).padStart(2, "0");
      const d = String(day).padStart(2, "0");
      const date = `${y}-${m}-${d}`;
      const isThisYear = Number(y) === currentDate.getFullYear();

      if (isSameMonth(parseISO(date), lastMonth)) lastMonthData.push(historicalData);

      if (isWinterSeason) {
        if (isDateInCurrentWinterSeason(date, currentDate)) {
          rainfall += dailyPrecipitationMm(historicalData);
          winterSnowCm += dailySnowCm(historicalData);
        }
      } else if (isDateInCurrentSummerSeason(date, currentDate) && isThisYear) {
        rainfall += dailyPrecipitationMm(historicalData);
      }

      if (isYesterday(parseISO(date))) {
        yesterdayRainfall = Number(dailyPrecipitationMm(historicalData).toFixed(1));
        yesterdaySnowfall = Number(dailySnowCm(historicalData).toFixed(1));
      }
    });

    this._seasonPrecipData.amount = Number(rainfall.toFixed(1));
    this._seasonPrecipData.season = isWinterSeason ? "winter" : "summer";
    if (isWinterSeason) {
      this._seasonPrecipData.snowfallSeasonCm = Number(winterSnowCm.toFixed(1));
    } else {
      delete this._seasonPrecipData.snowfallSeasonCm;
    }

    this._yesterdayPrecipData.amount = yesterdayRainfall;
    this._yesterdaySnowData.amount = yesterdaySnowfall;

    logger.log("Calculated precip data for the season/yesterday");

    this.processLastMonthsStats(lastMonthData);
  }

  private processLastMonthsStats(lastMonthData: HistoricalDataStats) {
    if (!lastMonthData?.length) {
      this._lastMonthSummary = null;
      return;
    }

    logger.log("Generating last month summary");

    const highTemps: LastMonthDayValue[] = [];
    const lowTemps: LastMonthDayValue[] = [];
    const meanTemps: LastMonthDayValue[] = [];
    const precipValues: LastMonthDayValue[] = [];

    lastMonthData.forEach((dayOfLastMonth) => {
      const maxTemp = Number(xmlText(dayOfLastMonth.maxtemp) ?? NaN);
      const minTemp = Number(xmlText(dayOfLastMonth.mintemp) ?? NaN);
      const meanTemp = Number(xmlText(dayOfLastMonth.meantemp) ?? NaN);

      const day = Number(dayOfLastMonth._attributes.day);
      if (!isNaN(maxTemp)) highTemps.push({ day, value: maxTemp });
      if (!isNaN(minTemp)) lowTemps.push({ day, value: minTemp });
      if (!isNaN(meanTemp)) meanTemps.push({ day, value: meanTemp });

      precipValues.push({ day, value: dailyPrecipitationMm(dayOfLastMonth) });
    });

    const averageHigh = highTemps.reduce((acc, curr) => (acc += curr.value), 0) / highTemps.length;
    const averageLow = lowTemps.reduce((acc, curr) => (acc += curr.value), 0) / lowTemps.length;
    const averageTemp = meanTemps.reduce((acc, curr) => (acc += curr.value), 0) / meanTemps.length;

    const totalPrecip = precipValues.reduce((acc, curr) => (acc += curr.value), 0);

    const [, warmestDayIx] = highTemps.reduce(
      (acc, curr, ix) => (curr.value > acc[0] ? [curr.value, ix] : acc),
      [Math.max(), -1]
    );
    const warmestDay = highTemps[warmestDayIx];

    const [, coldestDayIx] = lowTemps.reduce(
      (acc, curr, ix) => (curr.value < acc[0] ? [curr.value, ix] : acc),
      [Math.min(), -1]
    );
    const coldestDay = lowTemps[coldestDayIx];

    this._lastMonthSummary = {
      averageHigh,
      averageLow,
      averageTemp,
      totalPrecip,
      warmestDay,
      coldestDay,
    };
  }

  public lastYearTemperatures() {
    return this._lastYearTemperatures;
  }

  public seasonPrecipData() {
    return this._seasonPrecipData;
  }

  public yesterdayPrecipData() {
    return this._yesterdayPrecipData;
  }

  public yesterdaySnowData() {
    return this._yesterdaySnowData;
  }

  public lastMonthSummary() {
    return this._lastMonthSummary;
  }
}

let historicalTempPrecip: HistoricalTempPrecip = null;
export function initializeHistoricalTempPrecip(): HistoricalTempPrecip {
  if (process.env.NODE_ENV === "test") return new HistoricalTempPrecip();
  if (historicalTempPrecip) return historicalTempPrecip;

  historicalTempPrecip = new HistoricalTempPrecip();
  return historicalTempPrecip;
}
