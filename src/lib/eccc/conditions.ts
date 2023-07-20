const Weather = require("ec-weather-js");
import axios from "axios";
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
} from "types";
import { ecccDateStringToTSDate } from "lib/date";

const ECCC_BASE_API_URL = "https://dd.weather.gc.ca/citypage_weather/xml/";
const ECCC_API_ENGLISH_SUFFIX = "_e.xml";

const logger = new Logger("conditions");
const config = initializeConfig();
class CurrentConditions {
  private _amqpConnection: Connection;
  private _apiUrl: string;
  private _conditionUUID: string;
  private _weatherStationTimeData: WeatherStationTimeData;
  private _weatherStationCityName: string;
  private _conditions: ObservedConditions;
  private _sunRiseSet: SunRiseSet = { rise: null, set: null };
  private _almanac: Almanac = {
    temperatures: { extremeMin: null, extremeMax: null, normalMin: null, normalMax: null },
  };
  public stationLatLong: LatLong = { lat: 0, long: 0 };

  constructor() {
    this.startAMQPConnection();
    this._apiUrl = `${ECCC_BASE_API_URL}/${config.primaryLocation.province}/${config.primaryLocation.location}${ECCC_API_ENGLISH_SUFFIX}`;
    this.fetchConditions();
  }

  private startAMQPConnection() {
    if (this._amqpConnection) this._amqpConnection.disconnect();

    // hook up the amqp listener
    const { connection, emitter: listener } = listen({
      amqp_subtopic: `citypage_weather.xml.${config.primaryLocation.province}.#`,
    });

    // handle errors and messages
    listener.on("error", logger.error).on("message", (date: string, url: string) => {
      // make sure its relevant to us
      if (!url.includes(`${config.primaryLocation.location}_e.xml`)) return;

      this.fetchConditions();
      logger.log("Received new conditions from AMQP");
    });

    // store the connection so we can disconnect if needed
    this._amqpConnection = connection;

    logger.log("Started AMQP conditions listener");
  }

  private fetchConditions() {
    axios
      .get(this._apiUrl)
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
        const conditionUUID = this.generateConditionsUUID(weather.current?.dateTime[1].timeStamp ?? "");
        if (config.misc.rejectInHourConditionUpdates && conditionUUID === this._conditionUUID) {
          // update the forecast at least but reject the rest of it
          logger.log("Rejecting in-hour conditions update as", conditionUUID, "was already parsed");
          return;
        }

        // store the condition uuid for later use
        this._conditionUUID = conditionUUID;

        // store the observed date/time in our own format
        this.generateWeatherStationTimeData(weather.current?.dateTime[1] ?? {});

        // get city name info
        this._weatherStationCityName = allWeather.location.name.value;

        // get relevant conditions
        this.parseRelevantConditions(weather.current);

        // get sunrise/sunset info
        this.parseSunriseSunset(allWeather.riseSet);

        // get the almanac data (normal, records, etc.)
        this.generateAlmanac(allWeather.almanac);
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

  private generateConditionsUUID(timeStamp: string) {
    // the timestamp on <datetime ...> object is a good unique string to use for this
    // we'll just chop off the last 4 digits (mmss) as they can change a lot
    return timeStamp.slice(0, timeStamp.length - 4) ?? "";
  }

  private generateWeatherStationTimeData(date: any) {
    if (!date) return;

    // convert the date string into the users local time to begin with
    const localDate = ecccDateStringToTSDate(date.textSummary);

    // get the number of minutes behind that the local time is from UTC
    const offsetFromUTC = -localDate.getTimezoneOffset();

    // get the number of minutes behind taht the station time is from utc
    const stationOffsetFromUTC = parseInt(date.UTCOffset) * 60;

    // now we can figure out the difference between these and use it on the ui
    // timezones dont really exist in js so it'll really just end up being the local time
    // with some minutes added onto it
    const stationOffsetMinutesFromLocal = stationOffsetFromUTC - offsetFromUTC;

    // also store the actual timezone string for use on the ui
    this._weatherStationTimeData = { stationOffsetMinutesFromLocal, timezone: date.zone };
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
        direction: windDirectionValue,
      },
      visibility: { value: visibilityValue, units: visibilityUnits },
    } = conditions;

    // store it to our conditions
    this._conditions = {
      condition,
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
        speed: { value: Number(windSpeedValue), units: windSpeedUnits },
        gust: { value: Number(windGustValue), units: windGustUnits },
        direction: windDirectionValue,
      },
    };
  }

  private parseSunriseSunset(riseSet: ECCCSunRiseSet) {
    if (!riseSet) return;

    // get the non utc sunrise time (aka the time at the station)
    const sunrise: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunrise" && dateTime.zone === "UTC"
    );
    if (sunrise) this._sunRiseSet.rise = ecccDateStringToTSDate(sunrise.textSummary).toISOString();

    // get the non utc sunset time (aka the time at the station)
    const sunset: ECCCDateTime = riseSet.dateTime.find(
      (dateTime: ECCCDateTime) => dateTime.name === "sunset" && dateTime.zone === "UTC"
    );
    if (sunset) this._sunRiseSet.set = ecccDateStringToTSDate(sunset.textSummary).toISOString();
  }

  private generateAlmanac(almanac: ECCCAlmanac) {
    // TODO: fetch records from alternate source

    // get the extreme min temp
    const retrieveAlmanacTemp = (tempClass: string, parseYear: boolean = true) => {
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
  }

  public observed() {
    return {
      observationID: this._conditionUUID,
      city: this._weatherStationCityName,
      stationTime: this._weatherStationTimeData,
      observed: this._conditions,
      sunRiseSetUTC: this._sunRiseSet,
      almanac: this._almanac,
    };
  }
}

let currentConditions: CurrentConditions = null;
export function initializeCurrentConditions(): CurrentConditions {
  if (currentConditions) return currentConditions;

  currentConditions = new CurrentConditions();
  return currentConditions;
}