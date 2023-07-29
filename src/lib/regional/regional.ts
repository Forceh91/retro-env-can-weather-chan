const Weather = require("ec-weather-js");

import {
  EAST_WEATHER_STATIONS,
  MAX_WEATHER_STATIONS_TO_DISPLAY,
  MB_WEATHER_STATIONS,
  WEST_WEATHER_STATIONS,
} from "consts";
import { RegionalStationConfig, RegionalStationObservation, RegionalStationObservations } from "types";
import Logger from "lib/logger";
import axios from "axios";
import { harshTruncateConditions } from "lib/conditions";

const logger = new Logger("Regional");
class RegionalWeather {
  private _manitobaStations: RegionalStationObservations = [];
  private _eastStations: RegionalStationObservations = [];
  private _westStations: RegionalStationObservations = [];

  constructor() {
    this.fetchWeatherForStations(MB_WEATHER_STATIONS, this._manitobaStations);
    this.fetchWeatherForStations(EAST_WEATHER_STATIONS, this._eastStations);
    this.fetchWeatherForStations(WEST_WEATHER_STATIONS, this._westStations);
  }

  private isStationReporting(station: RegionalStationObservation) {
    return (
      station?.condition && !station?.condition?.toLowerCase().includes("unknown") && station?.temperature !== null
    );
  }

  private fetchWeatherForStations(stations: RegionalStationConfig[], observations: RegionalStationObservations) {
    // empty out the current observations and generate new data
    observations.splice(
      0,
      observations.length,
      ...[...stations].map((stationConfig) => ({ ...stationConfig, condition: null, temperature: null }))
    );

    // loop through stations and get current conditions for them
    stations.forEach((station) => this.fetchWeatherForStation(station, observations));
  }

  private fetchWeatherForStation(station: RegionalStationConfig, observations: RegionalStationObservations) {
    axios
      .get(`https://dd.weather.gc.ca/citypage_weather/xml/${station.code}_e.xml`)
      .then((resp) => {
        const data = resp && resp.data;
        const weather = new Weather(data);
        if (!weather) throw "Unable to parse weather data";

        const stationIx = observations.findIndex((observationStation) => observationStation.code === station.code);
        if (stationIx === -1) return;

        const {
          condition,
          temperature: { value: temperature },
        } = weather.current;

        observations.splice(stationIx, 1, {
          ...station,
          condition: condition ?? null,
          abbreviatedCondition: condition ? harshTruncateConditions(weather.current?.condition) : null,
          temperature: !isNaN(temperature) ? Number(temperature) : null,
        });
      })
      .catch((err) => logger.error(station.name, "failed to fetch data", err));
  }

  public regionalWeather() {
    // when we return we should filter down to just reporting stations, and then limit each one
    return {
      mb: this._manitobaStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_WEATHER_STATIONS_TO_DISPLAY),
      east: this._eastStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_WEATHER_STATIONS_TO_DISPLAY),
      west: this._westStations
        .filter((stationObservation) => this.isStationReporting(stationObservation))
        .slice(0, MAX_WEATHER_STATIONS_TO_DISPLAY),
    };
  }
}

let regionalWeather: RegionalWeather = null;
export function initializeRegionalWeather(): RegionalWeather {
  if (regionalWeather) return regionalWeather;

  regionalWeather = new RegionalWeather();
  return regionalWeather;
}
