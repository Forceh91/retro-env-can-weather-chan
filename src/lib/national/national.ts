const Weather = require("ec-weather-js");

import {
  EAST_WEATHER_STATIONS,
  EVENT_BUS_MAIN_STATION_UPDATE_NEW_CONDITIONS,
  MAX_NATIONAL_STATIONS_PER_PAGE,
  MB_WEATHER_STATIONS,
  NATIONAL_WEATHER_FETCH_INTERVAL,
  WEST_WEATHER_STATIONS,
} from "consts";
import { NationalStationConfig, NationalStationObservation, NationalStationObservations } from "types";
import Logger from "lib/logger";
import axios from "lib/backendAxios";
import { harshTruncateConditions } from "lib/conditions";
import { generateConditionsUUID } from "lib/eccc/utils";
import { initializeConfig } from "lib/config";
import eventbus from "lib/eventbus";
import { GetWeatherFileFromECCC } from "lib/eccc/datamart";

const config = initializeConfig();

const logger = new Logger("National");
class NationalWeather {
  private _manitobaStations: NationalStationObservations = [];
  private _eastStations: NationalStationObservations = [];
  private _westStations: NationalStationObservations = [];
  private _expectedConditionUUID: string;

  constructor() {
    this.periodicUpdate();
    setInterval(() => this.periodicUpdate(), NATIONAL_WEATHER_FETCH_INTERVAL);

    eventbus.addListener(EVENT_BUS_MAIN_STATION_UPDATE_NEW_CONDITIONS, (data) => this.forceUpdate(data));
  }

  private periodicUpdate(clearExistingData: boolean = false) {
    this.fetchWeatherForStations(MB_WEATHER_STATIONS, this._manitobaStations, clearExistingData);
    this.fetchWeatherForStations(EAST_WEATHER_STATIONS, this._eastStations, clearExistingData);
    this.fetchWeatherForStations(WEST_WEATHER_STATIONS, this._westStations, clearExistingData);
  }

  private forceUpdate(conditionUUID: string) {
    // update expected condition uuid from main station
    const hadExpectedConditionUUID = !!this._expectedConditionUUID;
    const shouldClear = this._expectedConditionUUID !== conditionUUID;
    this._expectedConditionUUID = conditionUUID;

    // if we didn't have an expected condition uuid, we dont need to force an update
    if (!hadExpectedConditionUUID) return;

    // otherwise we can call periodic update early since other stations probably updated
    this.periodicUpdate(shouldClear);
  }

  private isStationReporting(station: NationalStationObservation) {
    if (this._expectedConditionUUID && station.conditionUUID !== this._expectedConditionUUID) return;

    return (
      station?.condition && !station?.condition?.toLowerCase().includes("unknown") && station?.temperature !== null
    );
  }

  private fetchWeatherForStations(
    stations: NationalStationConfig[],
    observations: NationalStationObservations,
    clearExistingData: boolean = false
  ) {
    // empty out the current observations and generate new data
    if (clearExistingData || !observations?.length) {
      observations.splice(
        0,
        observations.length,
        ...[...stations].map(
          (stationConfig) =>
            ({ ...stationConfig, condition: null, temperature: null } as NationalStationConfig &
              NationalStationObservation)
        )
      );
    }

    // loop through stations and get current conditions for them
    stations.forEach((station) => this.fetchWeatherForStation(station, observations));
  }

  private fetchWeatherForStation(station: NationalStationConfig, observations: NationalStationObservations) {
    const [province, stationID] = station.code.split("/");
    GetWeatherFileFromECCC(province, stationID).then((url) => {
      url &&
        axios
          .get(url)
          .then((resp) => {
            const data = resp && resp.data;
            const weather = new Weather(data);
            if (!weather) throw "Unable to parse weather data";

            const stationIx = observations.findIndex((observationStation) => observationStation.code === station.code);
            if (stationIx === -1) return;

            const {
              condition,
              temperature: { value: temperature },
              dateTime: [utc],
            } = weather.current;

            // handle rejecting in-hour updates for these stations too
            const conditionUUID = generateConditionsUUID(utc.timeStamp);
            if (config.misc.rejectInHourConditionUpdates && conditionUUID === observations[stationIx].conditionUUID)
              return;

            // also reject if this station has updated to a new hour but the main station hasn't
            if (this._expectedConditionUUID && conditionUUID !== this._expectedConditionUUID) return;

            observations.splice(stationIx, 1, {
              ...station,
              condition: condition ?? null,
              abbreviatedCondition: condition ? harshTruncateConditions(weather.current?.condition) : null,
              temperature: temperature && !isNaN(temperature) ? Number(temperature) : null,
              conditionUUID,
            });
          })
          .catch((err) => logger.error(station.name, "failed to fetch data", err));
    });
  }

  public nationalWeather() {
    // when we return we should filter down to just reporting stations, and then limit each one
    return {
      mb: this._manitobaStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_NATIONAL_STATIONS_PER_PAGE),
      east: this._eastStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_NATIONAL_STATIONS_PER_PAGE),
      west: this._westStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_NATIONAL_STATIONS_PER_PAGE),
    };
  }
}

let nationalWeather: NationalWeather = null;
export function initializeNationalWeather(): NationalWeather {
  if (process.env.NODE_ENV === "test") return new NationalWeather();
  if (nationalWeather) return nationalWeather;

  nationalWeather = new NationalWeather();
  return nationalWeather;
}
