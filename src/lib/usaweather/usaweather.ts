import { USA_WEATHER_STATIONS, MAX_USA_STATIONS_PER_PAGE } from "consts";
import { USAStationConfig, USAStationObservation, USAStationObservations } from "types";
import Logger from "lib/logger";
import axios from "lib/backendAxios";
import { harshTruncateConditions } from "lib/conditions";

const logger = new Logger("USA");
class USAWeather {
  private _usaStations: USAStationObservations = [];

  constructor() {
    this.periodicUpdate();
    setInterval(() => this.periodicUpdate(), 5 * 60 * 1000);
  }

  private periodicUpdate() {
    this.fetchWeatherForStations(USA_WEATHER_STATIONS, this._usaStations);
  }

  private isStationReporting(station: USAStationObservation) {
    return (
      station?.condition && !station?.condition?.toLowerCase().includes("unknown") && station?.temperature !== null
    );
  }

  private fetchWeatherForStations(stations: USAStationConfig[], observations: USAStationObservations) {
    logger.log("Fetching latest observations");
    // empty out the current observations and generate new data
    observations.splice(
      0,
      observations.length,
      ...[...stations].map((stationConfig) => ({ ...stationConfig, condition: null, temperature: null }))
    );

    // loop through stations and get current conditions for them
    stations.forEach((station) => this.fetchWeatherForStation(station, observations));
  }

  private fetchWeatherForStation(station: USAStationConfig, observations: USAStationObservations) {
    axios
      .get(`https://api.weather.gov/stations/${station.code}/observations/latest`)
      .then((resp) => {
        const { data: weather } = resp;
        if (!weather) throw "Unable to parse USA weather data";

        const stationIx = observations.findIndex((observationStation) => observationStation.code === station.code);
        if (stationIx === -1) return;

        const { properties } = weather;

        const { textDescription: condition = null, temperature = null } = properties ?? {};
        observations.splice(stationIx, 1, {
          ...station,
          condition: condition ?? null,
          abbreviatedCondition: condition ? harshTruncateConditions(condition) : null,
          temperature: temperature?.value && !isNaN(temperature.value) ? Number(temperature.value) : null,
        });
      })
      .catch((err) => logger.error(station.name, "failed to fetch data", err));
  }

  public weather() {
    // when we return we should filter down to just reporting stations, and then limit each one
    return this._usaStations
      .filter((stationObservation) => this.isStationReporting(stationObservation))
      .slice(0, MAX_USA_STATIONS_PER_PAGE);
  }
}

let usaWeather: USAWeather = null;
export function initializeUSAWeather(): USAWeather {
  if (process.env.NODE_ENV === "test") return new USAWeather();
  if (usaWeather) return usaWeather;

  usaWeather = new USAWeather();
  return usaWeather;
}
