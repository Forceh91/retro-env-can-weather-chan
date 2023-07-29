import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import axios from "axios";
import { ElementCompact, xml2js } from "xml-js";
import { HistoricalPrecipData, HistoricalTemperatureAlmanac, WeatherStation } from "types";
import { isValid, isYesterday, parseISO } from "date-fns";
import { isDateInCurrentWinterSeason, getIsWinterSeason, isDateInCurrentSummerSeason } from "lib/date";

const logger = new Logger("Historical_Temp_Precip");
const config = initializeConfig();

class HistoricalTempPrecip {
  private _apiURL: string;
  private _historicalData: any[] = [];

  private _lastYearTemperatures: HistoricalTemperatureAlmanac = { min: null, max: null };
  private _seasonPrecipData: HistoricalPrecipData = { amount: 0, normal: 0, unit: "mm", type: "rain" };
  private _yesterdayPrecipData: HistoricalPrecipData = { amount: 0, normal: 0, unit: "mm", type: "rain" };

  constructor() {
    if (!config) return;

    logger.log("Initializing historical data for station ID:", config.historicalDataStationID);
    this._apiURL = `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=${config.historicalDataStationID}&Year=$YEAR&time=&timeframe=2`;
  }

  public fetchLastTwoYearsOfData(currentDate: Date = new Date()) {
    const currentYear = currentDate.getFullYear();
    const yearsToFetch = [currentYear - 1, currentYear];
    logger.log("Preparing to fetch historical data for years", yearsToFetch.join(""));

    // loop through years to fetch
    const promises: Promise<any>[] = [];
    yearsToFetch.forEach((year) => {
      logger.log("Fetching historical data for", year);

      promises.push(
        axios
          .get(this._apiURL.replace("$YEAR", year.toString()))
          .then((resp) => {
            const { data } = resp ?? {};
            if (!data) throw "No data";

            // convert the xml to js
            const historicalDataAsJSObject: ElementCompact = xml2js(data, { compact: true });
            if (!historicalDataAsJSObject) throw "Unable to convert to JS object";

            // make sure we can get climate data from it
            const climateData = historicalDataAsJSObject["climatedata"];
            if (!climateData) throw "No climate data";

            // and the station data
            const stationData = climateData["stationdata"];
            if (!stationData) throw "No station data";

            // now store it for use later on
            this._historicalData.push(...stationData);

            logger.log("Fetched historical data for", year);
          })
          .catch((err) => logger.error("Failed to fetch historical data for", year, err))
      );
    });

    Promise.allSettled(promises).then(() => this.parseHistoricalStationData(currentDate));
  }

  private parseHistoricalStationData(currentDate: Date) {
    this.parseLastYearTemperatures(currentDate);
    this.parseSeasonalPrecip(currentDate);
  }

  private parseLastYearTemperatures(currentDate: Date) {
    if (!this._historicalData?.length) return;

    // today is what current conditions observed date says
    if (!isValid(currentDate)) return;

    // get the data from today a year ago
    const todayLastYear = this._historicalData.find(
      (stationData) =>
        Number(stationData._attributes.day) === currentDate.getDate() &&
        Number(stationData._attributes.month) === currentDate.getMonth() + 1 &&
        Number(stationData._attributes.year) === currentDate.getFullYear() - 1
    );
    if (!todayLastYear) return;

    // and store the highest temp and lowest temp
    this._lastYearTemperatures.max = { value: Number(todayLastYear.maxtemp?._text), unit: "C" };
    this._lastYearTemperatures.min = { value: Number(todayLastYear.mintemp?._text), unit: "C" };
  }

  private parseSeasonalPrecip(currentDate: Date) {
    if (!this._historicalData?.length) return;

    // make sure the date is valid
    if (!isValid(currentDate)) return;

    logger.log("Calculating precip data for the season/yesterday");

    // precip data can spread across this year and last year during the winter so we need to loop through the entire thing
    const isWinterSeason = getIsWinterSeason();
    let rainfall = 0;
    let yesterdayRainfall = 0;
    this._historicalData?.forEach((historicalData) => {
      if (!historicalData?._attributes) return;

      const {
        _attributes: { year, month, day },
      } = historicalData;

      // date of data we're looking at, and if its from the current year
      const date = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      const isThisYear = Number(year) === currentDate.getFullYear();

      // normally if its summer we get rainfall, and if its winter we get snowfall
      // but eccc isn't accurate with storing snowfall anymore so we just go with rainfall
      if (isWinterSeason) {
        // back in the day winter season would've fetched snowfall in cm
        if (isDateInCurrentWinterSeason(date)) rainfall += Number(historicalData.totalprecipitation?._text ?? 0);
      } else {
        // summer season fetches rainfall in mm
        if (isDateInCurrentSummerSeason(date) && isThisYear)
          rainfall += Number(historicalData.totalprecipitation?._text ?? 0);
      }

      // also store yesterday's precip data, just for reasons
      if (isYesterday(parseISO(date)))
        yesterdayRainfall = Number(Number(historicalData?.totalprecipitation?._text ?? 0).toFixed(1));
    });

    // now we can store the total amount for the season
    this._seasonPrecipData.amount = Number(rainfall.toFixed(1));
    this._seasonPrecipData.season = isWinterSeason ? "winter" : "summer";

    // and the total amount for yesterday
    this._yesterdayPrecipData.amount = yesterdayRainfall;

    logger.log("Calculated precip data for the season/yesterday");
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
}

let historicalTempPrecip: HistoricalTempPrecip = null;
export function initializeHistoricalTempPrecip(): HistoricalTempPrecip {
  if (historicalTempPrecip) return historicalTempPrecip;

  historicalTempPrecip = new HistoricalTempPrecip();
  return historicalTempPrecip;
}
