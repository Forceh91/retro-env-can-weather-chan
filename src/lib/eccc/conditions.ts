const Weather = require("ec-weather-js");
import axios from "lib/backendAxios";
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

const ECCC_BASE_API_URL = "https://dd.weather.gc.ca/citypage_weather/xml/";
const ECCC_API_ENGLISH_SUFFIX = "_e.xml";

const logger = new Logger("conditions");
const config = initializeConfig();
const historicalData = initializeHistoricalTempPrecip();
const climateNormals = initializeClimateNormals();

class CurrentConditions {
  private _amqpConnection: Connection;
  private _apiUrl: string;
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

  constructor() {
    this.initialize();
    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_PRIMARY_LOCATION, () => this.initialize());
  }

  private initialize() {
    this._weatherStationID = config?.primaryLocation?.location;
    this._conditionUUID = "";

    this.startAMQPConnection();
    this._apiUrl = `${ECCC_BASE_API_URL}${config.primaryLocation.province}/${this._weatherStationID}${ECCC_API_ENGLISH_SUFFIX}`;
    this.fetchConditions();
  }

  private startAMQPConnection() {
    if (this._amqpConnection) this._amqpConnection.disconnect();

    // hook up the amqp listener
    const { connection, emitter: listener } = listen({
      amqp_subtopic: `*.WXO-DD.citypage_weather.xml.${config.primaryLocation.province}.#`,
    });

    // handle errors and messages
    listener
      .on("error", (...error) => logger.error("AMQP error:", error))
      .on("message", (date: string, url: string) => {
        // make sure its relevant to us
        if (!url.includes(`${this._weatherStationID}_e.xml`)) return;

        this.fetchConditions(url);
        logger.log("Received new conditions from AMQP at", date);
      });

    // store the connection so we can disconnect if needed
    this._amqpConnection = connection;

    logger.log("Started AMQP conditions listener");
  }

  private fetchConditions(url: string = this._apiUrl) {
    axios
      .get(url)
      .then((resp) => {
        // parse to weather object
        const weather = new Weather(resp.data);
        if (!weather) return;

        // make sure all weather is there
        const { all: allWeather } = weather;
        if (!allWeather) return;

        // store station lat/long
        this.parseStationLatLong(allWeather.location.name);

        // generate uuid for these conditions and reject if a config option is on
        const conditionUUID = generateConditionsUUID(weather.current?.dateTime[1].timeStamp ?? "");
        if (config.misc.rejectInHourConditionUpdates && conditionUUID === this._conditionUUID) {
          // update the forecast at least but reject the rest of it
          logger.log("Rejecting in-hour conditions update as", conditionUUID, "was already parsed");
          return;
        }

        // store the condition uuid for later use
        this._conditionUUID = conditionUUID;

        // store the observed date/time in our own format
        this.generateWeatherStationTimeData(weather.current?.dateTime[1] ?? {});

        // time/date done so now fetch historical data
        const observedDateTime: Date = this.observedDateTimeAtStation();
        historicalData.fetchLastTwoYearsOfData(observedDateTime);
        climateNormals.fetchClimateNormals(observedDateTime);

        // get city name info
        this._weatherStationCityName = allWeather.location.name.value;

        // get relevant conditions
        this.parseRelevantConditions(weather.current);

        // get sunrise/sunset info
        this.parseSunriseSunset(allWeather.riseSet);

        // get the almanac data (normal, records, etc.)
        this.generateAlmanac(allWeather.almanac);

        // calculate the windchill
        this.generateWindchill(weather.current);

        // generate the forecast
        this.generateForecast(weather.weekly);

        // check if we've got an alternate record source
        this.getTempRecordsForDay();

        // tell national stations what we're expecting
        eventbus.emit(
          EVENT_BUS_MAIN_STATION_UPDATE_NEW_CONDITIONS,
          generateConditionsUUID(weather.current?.dateTime[0].timeStamp)
        );
      })
      .catch((err) => {
        logger.error("Unable to retrieve update to conditions from ECCC API", err);
      });
  }

  private parseStationLatLong({ lat, lon }: { lat: string; lon: string }) {
    // we get these in string format with compass directions so we need to convert slightly
    // N is positive, S is negative
    if (lat.includes("N")) this.stationLatLong.lat = parseFloat(lat);
    else this.stationLatLong.lat = -parseFloat(lat);

    // E is postive, W is negative
    if (lon.includes("E")) this.stationLatLong.long = parseFloat(lon);
    else this.stationLatLong.long = -parseFloat(lon);
  }

  private generateWeatherStationTimeData(date: any) {
    if (!date) return;

    // convert the date string into the users local time to begin with
    const localDate = ecccDateStringToTSDate(date.textSummary);

    // get the number of minutes behind that the local time is from UTC
    const offsetFromUTC = -localDate.getTimezoneOffset();

    // get the number of minutes behind taht the station time is from utc
    const stationOffsetFromUTC = parseFloat(date.UTCOffset) * 60;

    // now we can figure out the difference between these and use it on the ui
    // timezones dont really exist in js so it'll really just end up being the local time
    // with some minutes added onto it
    const stationOffsetMinutesFromLocal = stationOffsetFromUTC - offsetFromUTC;

    // also store the actual timezone string for use on the ui
    this._weatherStationTimeData = {
      stationOffsetMinutesFromLocal,
      timezone: date.zone,
      observedDateTime: localDate.toISOString(),
    };
  }

  private parseRelevantConditions(conditions: ECCCConditions) {
    if (!conditions) return;

    // pull out the relevant info we want from eccc response
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

    // handle wind direction and visibility potentially being null
    const { value: windDirectionValue = null } = windDirection ?? {};
    const { value: visibilityValue = null, units: visibilityUnits = null } = visibility ?? {};

    // store it to our conditions
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
      visibility: { value: Number(visibilityValue), units: visibilityUnits },
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

    // get the utc sunrise time
    const sunrise: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunrise" && dateTime.zone !== "UTC"
    );
    if (sunrise) this._sunRiseSet.rise = ecccDateStringToTSDate(sunrise.textSummary).toISOString();

    // get the utc sunset time
    const sunset: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunset" && dateTime.zone !== "UTC"
    );
    if (sunset) this._sunRiseSet.set = ecccDateStringToTSDate(sunset.textSummary).toISOString();
  }

  private generateAlmanac(almanac: ECCCAlmanac) {
    // TODO: fetch records from alternate source

    // get the extreme min temp
    const retrieveAlmanacTemp = (tempClass: string, parseYear: boolean = true) => {
      if (!almanac) return null;

      // fetch from the almanac temperatures list
      const extremeTemp: ECCCAlmanacTemp = almanac.temperature.find(
        (temp: ECCCAlmanacTemp) => temp.class === tempClass
      );

      // if nothing return null
      if (!tempClass) return null;

      // otherwise parse it out and return
      const { value, year, units } = extremeTemp;
      return { value: Number(value), year: parseYear ? parseInt(year) : undefined, unit: units };
    };

    // extreme min/max
    this._almanac.temperatures.extremeMin = retrieveAlmanacTemp("extremeMin");
    this._almanac.temperatures.extremeMax = retrieveAlmanacTemp("extremeMax");

    // normal min/max
    this._almanac.temperatures.normalMin = retrieveAlmanacTemp("normalMin", false);
    this._almanac.temperatures.normalMax = retrieveAlmanacTemp("normalMax", false);

    // last year min/max is done at request time for observed to make sure we have that data
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

    // get the temp record if there are any
    const tempRecord = await getTempRecordForDate(config.misc.alternateRecordsSource, this.observedDateTimeAtStation());
    if (!tempRecord) return;

    // update hi/lo values
    if (tempRecord.hi)
      this._almanac.temperatures.extremeMax = { value: tempRecord.hi.value, year: tempRecord.hi.year, unit: "C" };
    if (tempRecord.lo)
      this._almanac.temperatures.extremeMin = { value: tempRecord.lo.value, year: tempRecord.lo.year, unit: "C" };
  }

  public observed() {
    return {
      observationID: this._conditionUUID,
      city: this._weatherStationCityName,
      stationTime: this._weatherStationTimeData,
      stationID: this._weatherStationID,
      observed: { ...this._conditions, windchill: this._windchill },
      almanac: {
        ...this._almanac,
        temperatures: {
          ...this._almanac.temperatures,
          lastYearMin: historicalData.lastYearTemperatures().min,
          lastYearMax: historicalData.lastYearTemperatures().max,
        },
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
      almanac: { ...this._almanac, sunRiseSet: this._sunRiseSet },
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
