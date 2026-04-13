const Weather = require("ec-weather-js");
import { isAxiosError, type AxiosResponse } from "axios";
import backendAxios from "lib/backendAxios";
import { listen } from "lib/amqp";
import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import { Connection } from "types/amqp.types";
import {
  LatLong,
  ObservedConditions,
  WeatherStationTimeData,
  ECCCConditions,
  ECCCSunRiseSet,
  ECCCDateTime,
  SunRiseSet,
  ECCCAlmanac,
  ECCCAlmanacTemp,
  Almanac,
  ECCCWeekForecast,
  ECCCForecast,
  WeekForecast,
} from "types";
import { ecccDateStringToTSDate } from "lib/date";
import {
  calculateWindchill,
  abbreviateForecast,
  harshTruncateConditions,
  frontLoadTemperatureOnForecast,
} from "lib/conditions";
import {
  FORECAST_THREE_ISH_LINES_WITH_PREFIX_MAX_LENGTH,
  FORECAST_TWO_LINE_WITH_PREFIX_MAX_LENGTH,
} from "consts/forecast.consts";
import {
  CONDITIONS_WIND_SPEED_CALM,
  EVENT_BUS_CONFIG_CHANGE_PRIMARY_LOCATION,
  EVENT_BUS_MAIN_STATION_UPDATE_NEW_CONDITIONS,
} from "consts";
import { addMinutes, isValid, parseISO } from "date-fns";
import { initializeHistoricalTempPrecip } from "./historicalTempPrecip";
import { initializeClimateNormals } from "./climateNormals";
import { generateConditionsUUID } from "./utils";
import eventbus from "lib/eventbus";
import { getTempRecordForDate } from "lib/temprecords";
import { GetWeatherFileFromECCC, legacyHpfxCitypageEnglishXmlUrl } from "./datamart";
import { isLooseNull } from "lib/isnull";
import { axiosGetWithMscMirror, normalizeMscHttpUrl } from "lib/eccc/mscHttpMirror";
import {
  citypageStaleFallbackAfterMs,
  citypageStaleFallbackCheckIntervalMs,
  isCitypageStaleFallbackDisabled,
  shouldRunCitypageStaleHttpPoll,
} from "lib/eccc/citypageStaleFallback";

const logger = new Logger("conditions");
const config = initializeConfig();
const historicalData = initializeHistoricalTempPrecip();
const climateNormals = initializeClimateNormals();

/** `forecastGroup.regionalNormals` after ec-weather-js restructure (on `weather.all`). */
type RegionalNormalsFromFeed = {
  temperature?: ECCCAlmanacTemp | ECCCAlmanacTemp[];
};

class CurrentConditions {
  private _amqpConnection: Connection;
  private _conditionUUID: string;
  private _weatherStationTimeData: WeatherStationTimeData;
  private _weatherStationCityName: string;
  private _weatherStationID: string;
  private _conditions: ObservedConditions;
  private _sunRiseSet: SunRiseSet = { rise: null, set: null, timezone: "local" };
  private _almanac: Almanac = {
    temperatures: {
      extremeMin: null,
      extremeMax: null,
      normalMin: null,
      normalMax: null,
      lastYearMax: null,
      lastYearMin: null,
    },
  };
  private _windchill: number | null;
  private _forecast: WeekForecast;
  public stationLatLong: LatLong = { lat: 0, long: 0 };
  private _conditionsFetchBusy = false;
  private _conditionsFetchPending: { url?: string } | null = null;
  private _conditionsFetchedAt: string | null = null;
  private _conditionsApplyGen = 0;
  private _conditionsInFlightAbort: AbortController | null = null;
  private _staleHttpFallbackTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.initialize();
    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_PRIMARY_LOCATION, () => this.initialize());
  }

  private initialize() {
    this._weatherStationID = config?.primaryLocation?.location;
    this._conditionUUID = "";

    this.clearStaleHttpFallbackWatcher();
    this.startAMQPConnection();
    this.requestConditionsFetch();
    this.startStaleHttpFallbackWatcher();
  }

  private clearStaleHttpFallbackWatcher(): void {
    if (this._staleHttpFallbackTimer !== null) {
      clearInterval(this._staleHttpFallbackTimer);
      this._staleHttpFallbackTimer = null;
    }
  }

  /**
   * If MSC AMQP is silent for a long time, still re-fetch citypage XML via the same datamart/HPFX path
   * as bootstrap so the display can advance when ECCC publishes without us seeing a broker notification.
   */
  private startStaleHttpFallbackWatcher(): void {
    this.clearStaleHttpFallbackWatcher();
    if (process.env.NODE_ENV === "test" || isCitypageStaleFallbackDisabled()) return;

    const intervalMs = citypageStaleFallbackCheckIntervalMs();
    const staleAfterMs = citypageStaleFallbackAfterMs();
    this._staleHttpFallbackTimer = setInterval(() => this.tickStaleHttpFallback(), intervalMs);
    logger.log(
      "Citypage stale HTTP fallback: check every",
      Math.round(intervalMs / 60000),
      "min if last successful parse older than",
      Math.round(staleAfterMs / 3600000),
      "h"
    );
  }

  private tickStaleHttpFallback(): void {
    if (this._conditionsFetchBusy) return;
    const staleAfterMs = citypageStaleFallbackAfterMs();
    if (!shouldRunCitypageStaleHttpPoll(this._conditionsFetchedAt, Date.now(), staleAfterMs)) return;

    logger.log(
      "Citypage stale HTTP fallback: requesting datamart resolve + fetch (last successful parse exceeded threshold)"
    );
    this.requestConditionsFetch();
  }

  private startAMQPConnection() {
    if (this._amqpConnection) this._amqpConnection.disconnect();

    const { connection, emitter: listener } = listen({
      amqp_subtopic: `*.WXO-DD.citypage_weather.${config.primaryLocation.province}.#`,
    });

    listener
      .on("error", (...error) => {
        logger.error("AMQP error:", error);
      })
      .on("message", (date: string, url: string) => {
        if (!url.endsWith(`${this._weatherStationID}_en.xml`)) return;

        this.requestConditionsFetch(url);
        logger.log("Received new conditions from AMQP at", date);
      });

    this._amqpConnection = connection;

    logger.log("Started AMQP conditions listener");
  }

  /** Coalesces overlapping fetches; AMQP URL wins over a queued datamart resolve. */
  private requestConditionsFetch(url?: string) {
    if (this._conditionsFetchBusy) {
      if (url !== undefined) {
        this._conditionsFetchPending = { url };
        this._conditionsInFlightAbort?.abort();
      } else if (!this._conditionsFetchPending) {
        this._conditionsFetchPending = {};
      }
      return;
    }
    void this.runConditionsFetch(url);
  }

  public getLastSuccessfulFetchIso(): string | null {
    return this._conditionsFetchedAt;
  }

  /** Operator hook: coalesced citypage HTTP fetch (same path as AMQP-driven updates). */
  public requestCitypageRefresh(): void {
    this.requestConditionsFetch();
  }

  /**
   * Parse citypage GET response into live conditions. `unparsed` means try another URL (bad body).
   */
  private applyCitypageHttpResponse(resp: AxiosResponse, applyGen: number): "applied" | "stale" | "unparsed" {
    if (applyGen !== this._conditionsApplyGen) return "stale";

    const weather = new Weather(resp.data);
    if (!weather) return "unparsed";

    const { all: allWeather } = weather;
    if (!allWeather) return "unparsed";

    this.parseStationLatLong(allWeather.location.name);

    const conditionUUID = generateConditionsUUID(weather.current?.dateTime[1].timeStamp ?? "");
    if (config.misc.rejectInHourConditionUpdates && conditionUUID === this._conditionUUID) {
      logger.log("Rejecting in-hour conditions update as", conditionUUID, "was already parsed");
      return "applied";
    }

    this._conditionUUID = conditionUUID;
    this.generateWeatherStationTimeData(weather.current?.dateTime[1] ?? {});

    const observedDateTime: Date = this.observedDateTimeAtStation();
    historicalData.fetchLastTwoYearsOfData(observedDateTime);
    climateNormals.fetchClimateNormals(observedDateTime);

    this._weatherStationCityName = allWeather.location.name.value;
    this.parseRelevantConditions(weather.current);
    this.parseSunriseSunset(allWeather.riseSet);
    this.generateAlmanac(allWeather.almanac);
    this.fillAlmanacNormalsFromRegional(
      (allWeather as { regionalNormals?: RegionalNormalsFromFeed }).regionalNormals
    );
    this.generateWindchill(weather.current);
    this.generateForecast(weather.weekly);
    void this.getTempRecordsForDay();

    this._conditionsFetchedAt = new Date().toISOString();

    eventbus.emit(EVENT_BUS_MAIN_STATION_UPDATE_NEW_CONDITIONS, weather.current?.dateTime[0].timeStamp);

    logger.log("Parsed new conditions with UUID of", conditionUUID);
    return "applied";
  }

  private async tryCitypageFetchCandidate(
    fetchUrl: string,
    applyGen: number,
    signal: AbortSignal,
    label: string
  ): Promise<"ok" | "stale" | "continue"> {
    try {
      const resp = await axiosGetWithMscMirror(backendAxios, fetchUrl, { signal });
      const applied = this.applyCitypageHttpResponse(resp, applyGen);
      if (applied === "stale") return "stale";
      if (applied === "applied") return "ok";
      logger.warn(`${label}: response was not usable; trying next citypage source`);
      return "continue";
    } catch (err) {
      if (isAxiosError(err) && err.code === "ERR_CANCELED") return "stale";
      logger.warn(`${label}: fetch failed; trying next citypage source`, err);
      return "continue";
    }
  }

  /**
   * Citypage load order: AMQP URL (fast path) → hourly bucket URL (HPFX/Datamart-safe) → legacy HPFX `/xml/…_e.xml`.
   */
  private async runConditionsFetch(url?: string): Promise<void> {
    this._conditionsFetchBusy = true;
    const controller = new AbortController();
    this._conditionsInFlightAbort = controller;
    const { signal } = controller;
    const applyGen = ++this._conditionsApplyGen;
    const province = config.primaryLocation.province;
    const stationId = config.primaryLocation.location;

    try {
      if (url !== undefined) {
        const amqp = await this.tryCitypageFetchCandidate(
          normalizeMscHttpUrl(url),
          applyGen,
          signal,
          "AMQP citypage"
        );
        if (amqp === "ok" || amqp === "stale") return;
      }

      if (applyGen !== this._conditionsApplyGen) return;

      const hourly = await GetWeatherFileFromECCC(province, stationId);
      if (applyGen !== this._conditionsApplyGen) return;

      if (hourly) {
        const h = await this.tryCitypageFetchCandidate(hourly, applyGen, signal, "Hourly citypage (datamart resolve)");
        if (h === "ok" || h === "stale") return;
      }

      if (applyGen !== this._conditionsApplyGen) return;

      const legacy = legacyHpfxCitypageEnglishXmlUrl(province, stationId);
      const leg = await this.tryCitypageFetchCandidate(legacy, applyGen, signal, "Legacy HPFX xml citypage");
      if (leg === "ok" || leg === "stale") return;

      logger.error("Unable to retrieve update to conditions from ECCC API (all citypage sources exhausted)");
    } finally {
      if (this._conditionsInFlightAbort === controller) {
        this._conditionsInFlightAbort = null;
      }
      this._conditionsFetchBusy = false;
      const pending = this._conditionsFetchPending;
      this._conditionsFetchPending = null;
      if (pending) {
        void this.runConditionsFetch(pending.url);
      }
    }
  }

  private parseStationLatLong({ lat, lon }: { lat: string; lon: string }) {
    if (lat.includes("N")) this.stationLatLong.lat = parseFloat(lat);
    else this.stationLatLong.lat = -parseFloat(lat);

    if (lon.includes("E")) this.stationLatLong.long = parseFloat(lon);
    else this.stationLatLong.long = -parseFloat(lon);
  }

  private generateWeatherStationTimeData(date: any) {
    if (!date) return;

    const localDate = ecccDateStringToTSDate(date.textSummary);

    const offsetFromUTC = -localDate.getTimezoneOffset();

    const stationOffsetFromUTC = parseFloat(date.UTCOffset) * 60;

    const stationOffsetMinutesFromLocal = stationOffsetFromUTC - offsetFromUTC;

    this._weatherStationTimeData = {
      stationOffsetMinutesFromLocal,
      timezone: date.zone,
      observedDateTime: localDate.toISOString(),
    };
  }

  private parseRelevantConditions(conditions: ECCCConditions) {
    if (!conditions) return;

    const {
      condition,
      temperature: { units: temperatureUnits, value: temperatureValue },
      pressure: { change: pressureChange, tendency: pressureTendency, units: pressureUnits, value: pressureValue },
      relativeHumidity: { units: humidityUnits, value: humidityValue },
      wind: {
        speed: { value: windSpeedValue, units: windSpeedUnits },
        gust: { value: windGustValue, units: windGustUnits },
        direction: windDirection,
      },
      visibility,
    } = conditions;

    const { value: windDirectionValue = null } = windDirection ?? {};
    const { value: visibilityValue = null, units: visibilityUnits = null } = visibility ?? {};

    let massagedVisibilityValue: number | string | null | undefined = visibilityValue;
    if (!isLooseNull(visibilityValue)) massagedVisibilityValue = Number(visibilityValue);

    this._conditions = {
      condition,
      abbreviatedCondition: harshTruncateConditions(condition),
      temperature: { value: Number(temperatureValue), units: temperatureUnits },
      pressure: {
        change: Number(pressureChange),
        tendency: pressureTendency ?? "",
        value: Number(pressureValue),
        units: pressureUnits,
      },
      humidity: { value: Number(humidityValue), units: humidityUnits },
      visibility: { value: massagedVisibilityValue as number | null | undefined, units: visibilityUnits },
      wind: {
        speed: {
          value:
            windSpeedValue.toLowerCase() !== CONDITIONS_WIND_SPEED_CALM
              ? Number(windSpeedValue)
              : windSpeedValue.toLowerCase(),
          units: windSpeedUnits,
        },
        gust: windGustValue ? { value: Number(windGustValue), units: windGustUnits } : null,
        direction: windDirectionValue,
      },
    };
  }

  private parseSunriseSunset(riseSet: ECCCSunRiseSet) {
    if (!riseSet) return;

    const sunrise: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunrise" && dateTime.zone !== "UTC"
    );
    if (sunrise) this._sunRiseSet.rise = ecccDateStringToTSDate(sunrise.textSummary).toISOString();

    const sunset: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunset" && dateTime.zone !== "UTC"
    );
    if (sunset) this._sunRiseSet.set = ecccDateStringToTSDate(sunset.textSummary).toISOString();
  }

  private mergedAlmanacTemperatures() {
    return {
      ...this._almanac.temperatures,
      lastYearMin: historicalData.lastYearTemperatures().min,
      lastYearMax: historicalData.lastYearTemperatures().max,
    };
  }

  private generateAlmanac(almanac: ECCCAlmanac | null | undefined) {
    const temps: ECCCAlmanacTemp[] = !almanac?.temperature
      ? []
      : Array.isArray(almanac.temperature)
        ? almanac.temperature
        : [almanac.temperature];

    const retrieveAlmanacTemp = (tempClass: string, parseYear: boolean = true) => {
      if (!temps.length || !tempClass) return null;

      const entry = temps.find((temp: ECCCAlmanacTemp) => temp.class === tempClass);
      if (!entry) return null;

      const num = Number(entry.value);
      if (!Number.isFinite(num)) return null;

      const y = entry.year != null ? parseInt(String(entry.year), 10) : NaN;
      return {
        value: num,
        year: parseYear && Number.isFinite(y) ? y : undefined,
        unit: entry.units ?? "C",
      };
    };

    this._almanac.temperatures.extremeMin = retrieveAlmanacTemp("extremeMin");
    this._almanac.temperatures.extremeMax = retrieveAlmanacTemp("extremeMax");

    this._almanac.temperatures.normalMin = retrieveAlmanacTemp("normalMin", false);
    this._almanac.temperatures.normalMax = retrieveAlmanacTemp("normalMax", false);
  }

  private fillAlmanacNormalsFromRegional(regionalNormals: RegionalNormalsFromFeed | null | undefined) {
    if (!regionalNormals) return;
    if (this._almanac.temperatures.normalMin != null && this._almanac.temperatures.normalMax != null) return;

    const raw = regionalNormals.temperature;
    const list: ECCCAlmanacTemp[] = !raw ? [] : Array.isArray(raw) ? raw : [raw];

    for (const t of list) {
      const v = Number(t.value);
      if (!Number.isFinite(v)) continue;
      const unit = t.units ?? "C";
      if (t.class === "low" && this._almanac.temperatures.normalMin == null) {
        this._almanac.temperatures.normalMin = { value: v, unit };
      }
      if (t.class === "high" && this._almanac.temperatures.normalMax == null) {
        this._almanac.temperatures.normalMax = { value: v, unit };
      }
    }
  }

  private generateWindchill(conditions: ECCCConditions) {
    const {
      temperature: { value: temperatureValue },
      wind: {
        speed: { value: windSpeedValue },
      },
    } = conditions;

    this._windchill = calculateWindchill(Number(temperatureValue ?? 0), Number(windSpeedValue ?? 0));
  }

  private generateForecast(weekForecast: ECCCWeekForecast) {
    this._forecast = weekForecast.map((forecast: ECCCForecast, ix: number) => {
      const {
        day,
        textSummary,
        temperatures: {
          textSummary: temperatureTextSummary,
          temperature: { value: temperatureValue, class: temperatureClass },
        },
        abbreviatedForecast: { textSummary: conditions },
      } = forecast;
      const period = !ix ? (day?.includes("night") ? "Tonight" : "Today") : day;

      const frontLoadedTemperature = frontLoadTemperatureOnForecast(temperatureTextSummary, textSummary);

      return {
        period,
        textSummary,
        abbreviatedTextSummary: abbreviateForecast(
          frontLoadedTemperature,
          !ix ? FORECAST_THREE_ISH_LINES_WITH_PREFIX_MAX_LENGTH : FORECAST_TWO_LINE_WITH_PREFIX_MAX_LENGTH
        ),
        temperature: { value: Number(temperatureValue), class: temperatureClass },
        conditions,
      };
    });
  }

  private async getTempRecordsForDay() {
    if (!config.misc.alternateRecordsSource?.length) return;

    const tempRecord = await getTempRecordForDate(config.misc.alternateRecordsSource, this.observedDateTimeAtStation());
    if (!tempRecord) return;

    if (tempRecord.hi) {
      this._almanac.temperatures.extremeMax = { value: tempRecord.hi.value, year: tempRecord.hi.year, unit: "C" };
    }
    if (tempRecord.lo) {
      this._almanac.temperatures.extremeMin = { value: tempRecord.lo.value, year: tempRecord.lo.year, unit: "C" };
    }
  }

  public observed() {
    return {
      observationID: this._conditionUUID,
      city: this._weatherStationCityName,
      stationTime: this._weatherStationTimeData,
      stationID: this._weatherStationID,
      fetchedAt: this._conditionsFetchedAt,
      observed: { ...this._conditions, windchill: this._windchill },
      almanac: {
        ...this._almanac,
        temperatures: this.mergedAlmanacTemperatures(),
        sunRiseSet: this._sunRiseSet,
      },
      forecast: this._forecast,
    };
  }

  public forecast() {
    return {
      observationID: this._conditionUUID,
      city: this._weatherStationCityName,
      stationTime: this._weatherStationTimeData,
      stationID: this._weatherStationID,
      forecast: this._forecast,
    };
  }

  public almanac() {
    return {
      observationID: this._conditionUUID,
      city: this._weatherStationCityName,
      stationTime: this._weatherStationTimeData,
      stationID: this._weatherStationID,
      almanac: {
        ...this._almanac,
        temperatures: this.mergedAlmanacTemperatures(),
        sunRiseSet: this._sunRiseSet,
      },
    };
  }

  public observedDateTime() {
    return this._weatherStationTimeData && parseISO(this._weatherStationTimeData.observedDateTime);
  }

  public observedDateTimeAtStation() {
    if (!this._weatherStationTimeData?.observedDateTime) return new Date();
    const stationTime = parseISO(this._weatherStationTimeData.observedDateTime);
    return isValid(stationTime)
      ? addMinutes(stationTime, this._weatherStationTimeData.stationOffsetMinutesFromLocal)
      : new Date();
  }
}

let currentConditions: CurrentConditions = null;
export function initializeCurrentConditions(): CurrentConditions {
  if (process.env.NODE_ENV === "test") return new CurrentConditions();
  if (currentConditions) return currentConditions;

  currentConditions = new CurrentConditions();
  return currentConditions;
}
