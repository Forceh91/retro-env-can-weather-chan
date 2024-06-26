const Weather = require("ec-weather-js");
import fs from "fs";
import { EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING, PROVINCE_TRACKING_TEMP_TO_TRACK } from "consts";
import axios from "lib/backendAxios";
import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import { ProvinceStationTracking, ProvinceStations } from "types";
import { initializeCurrentConditions, initializeHistoricalTempPrecip } from "lib/eccc";
import eventbus from "lib/eventbus";
import { format, subDays } from "date-fns";

const logger = new Logger("ProvinceTracking");
const PROVINCE_TRACKING_FILE = "db/province_tracking.json";

const conditions = initializeCurrentConditions();
const historicalData = initializeHistoricalTempPrecip();

class ProvinceTracking {
  private _stations: ProvinceStations;
  private _tracking: ProvinceStationTracking[];
  private _displayTemp: string;
  private _tempToTrack: string;
  private _yesterdayPrecipDate: string = "";

  constructor() {
    this.load();
    this.initialize();
    setInterval(() => this.periodicUpdate(), 5 * 60 * 1000);

    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING, () => this.initialize());
  }

  private initialize() {
    if (!config.provinceHighLowEnabled) {
      logger.log("Province tracking is disabled");
      return;
    }

    // store what stations we're tracking
    this._stations = config.provinceStations ?? [];

    // if we're tracking stations already then filter out stations that aren't in the stations list, otherwise do an empty array
    this._tracking = this._tracking
      ? this._tracking.filter(
          (trackingStation) =>
            this._stations.findIndex((station) => trackingStation.station.code === station.code) !== -1
        )
      : [];
    logger.log("Tracking", this._stations?.length || 0, "locations across the province");

    this.periodicUpdate();
  }

  private periodicUpdate() {
    if (!this._tracking?.length) {
      this._tracking = this._stations.map((provinceStation) => ({
        station: provinceStation,
        minTemp: Math.min(),
        maxTemp: Math.max(),
        displayTemp: null,
        yesterdayPrecip: null,
        yesterdayPrecipUnit: "mm",
      }));
    }

    // check what temps to track/display
    const displayTemp = this._displayTemp;
    this.setTempScaleToDisplay();
    this.setTempScaleToTrack();

    // if the tracking temp changed from min->max or vice versa we need to reset some tracking
    if (displayTemp !== this._displayTemp) this.resetTracking(!!displayTemp);

    logger.log("Updating data for stations");

    // loop through stations and get the conditions for them
    const promises: Promise<void>[] = [];
    this._tracking.forEach((station) => promises.push(this.fetchWeatherForStation(station)));

    Promise.allSettled(promises).then(() => this.save());
  }

  private fetchWeatherForStation(station: ProvinceStationTracking) {
    const { name, code } = station.station;

    return axios
      .get(`https://dd.weather.gc.ca/citypage_weather/xml/${code}_e.xml`)
      .then((resp) => {
        const data = resp && resp.data;
        const weather = new Weather(data);
        if (!weather) throw "Unable to parse weather data";

        // store the precip for yesterday if there's no data or its after 2am
        // 2am seems to be when the api returns yesterday's data
        if (station.yesterdayPrecip === null || this.shouldUpdatePrecipData()) {
          const { yesterdayConditions } = weather.all;

          // if selected station then use historical data, otherwise we can use the data from the conditions api
          const isLocalStation =
            station.station.code === `${config.primaryLocation.province}/${config.primaryLocation.location}`;

          // pull in precip values with plenty of fallbacks so we do our best to display a value
          const detailedPrecip = isLocalStation
            ? historicalData.yesterdaySnowData().amount || historicalData.yesterdayPrecipData().amount
            : null;

          // now store these to the station
          const yesterdayPrecip = (detailedPrecip || yesterdayConditions?.precip?.value) ?? "MISSING";
          station.yesterdayPrecip = !isNaN(yesterdayPrecip) ? Number(yesterdayPrecip) : yesterdayPrecip;
          station.yesterdayPrecipUnit =
            isLocalStation && historicalData.yesterdaySnowData().amount > 0 ? "cm snow" : "mm";

          // store what date this data is from
          this._yesterdayPrecipDate = format(subDays(conditions.observedDateTimeAtStation(), 1), "MMM dd").replace(
            /\s0/i,
            "  "
          );
        }

        // get the temperature reading
        const temp = weather.current?.temperature?.value;
        if (temp === null || temp === undefined || isNaN(temp)) return;

        // update corresponding value
        const tempAsNumber = Number(temp);
        if (this._tempToTrack === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP) {
          if (station.minTemp === null || tempAsNumber < station.minTemp) station.minTemp = tempAsNumber;
        } else if (this._tempToTrack === PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP) {
          if (station.maxTemp === null || tempAsNumber > station.maxTemp) station.maxTemp = tempAsNumber;
        }
      })
      .catch((err) => logger.error(name, "failed to fetch data", err));
  }

  private resetTracking(resetTemps: boolean) {
    logger.log("Switching over tracking and setting display value");

    this._tracking.forEach((station, ix, arr) => {
      // if min temp is now being displayed, reset the max and show min
      if (this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP) {
        arr[ix] = {
          ...arr[ix],
          // set display value as min
          displayTemp: station.minTemp !== null && station.minTemp !== Math.min() ? station.minTemp : "M",
          // reset the max tracker
          maxTemp: resetTemps ? Math.max() : station.maxTemp,
        };
      } else if (this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP) {
        arr[ix] = {
          ...arr[ix],
          // set display value as min
          displayTemp: station.maxTemp !== null && station.maxTemp !== Math.max() ? station.maxTemp : "M",
          // reset the min tracker
          minTemp: resetTemps ? Math.min() : station.minTemp,
        };
      }
    });
  }

  private setTempScaleToTrack() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    // from 8pm to 8am we need to track the min temp
    // from 8am to 8pm we need to track the max temp
    if (hour >= 20 || hour < 8) this._tempToTrack = PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP;
    else this._tempToTrack = PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP;
  }

  private setTempScaleToDisplay() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    // from 8pm to 8am we need to display the max temp
    // from 8am to 8pm we need to display the min temp
    if (hour >= 20 || hour < 8) this._displayTemp = PROVINCE_TRACKING_TEMP_TO_TRACK.MAX_TEMP;
    else this._displayTemp = PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP;
  }

  private shouldUpdatePrecipData() {
    const time = conditions?.observedDateTimeAtStation();
    const hour = time.getHours();

    // if it's after 2am we can update precip data, if not leave it as is
    return hour >= 2;
  }

  private load() {
    logger.log("Loading province tracking from", PROVINCE_TRACKING_FILE);
    try {
      const data = fs.readFileSync(PROVINCE_TRACKING_FILE, "utf8");
      if (!data?.length) throw "No data present in json";

      this._tracking = JSON.parse(data);

      logger.log("Loaded province tracking from json");
    } catch (err) {
      if (err.code === "ENOENT") {
        // handle no file found
        logger.error("No province tracking found");
      } else {
        // handle any other error
        logger.error("Unable to load from province tracking json");
      }
    }
  }

  private save() {
    logger.log("Storing province tracking");

    fs.writeFile(PROVINCE_TRACKING_FILE, JSON.stringify(this._tracking), "utf8", () => {
      logger.log("Stored province tracking");
    });
  }

  public provinceTracking() {
    return {
      tracking: this._tracking,
      isOvernight: this._displayTemp === PROVINCE_TRACKING_TEMP_TO_TRACK.MIN_TEMP,
      yesterdayPrecipDate: this._yesterdayPrecipDate,
    };
  }
}

const config = initializeConfig();

let provinceTracking: ProvinceTracking = null;
export function initializeProvinceTracking(): ProvinceTracking {
  if (process.env.NODE_ENV === "test") return new ProvinceTracking();
  if (provinceTracking) return provinceTracking;

  provinceTracking = new ProvinceTracking();
  return provinceTracking;
}
