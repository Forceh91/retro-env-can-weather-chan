import { SUNSPOT_CITIES } from "consts";
import { SunspotStationConfig, SunspotStationObservation, SunspotStationObservations } from "types";
import Logger from "lib/logger";
import axios from "lib/backendAxios";
import { harshTruncateConditions } from "lib/conditions";
import { convertFToC } from "lib/usaweather";
import { isSunSpotSeason } from "lib/date";

const logger = new Logger("Sunspots");
class Sunspots {
  private _sunspotStations: SunspotStationObservations = [];

  constructor() {
    this.periodicUpdate();
    setInterval(() => this.periodicUpdate(), 5 * 60 * 1000);
  }

  private periodicUpdate() {
    if (!isSunSpotSeason()) return;
    this.fetchWeatherForStations(SUNSPOT_CITIES, this._sunspotStations);
  }

  private isStationReporting(station: SunspotStationObservation) {
    return (
      station?.forecast &&
      !station?.forecast?.toLowerCase().includes("unknown") &&
      station?.highTemp !== null &&
      station.lowTemp !== null
    );
  }

  private fetchWeatherForStations(stations: SunspotStationConfig[], observations: SunspotStationObservations) {
    logger.log("Fetching latest observations");
    // empty out the current observations and generate new data
    observations.splice(
      0,
      observations.length,
      ...[...stations].map((stationConfig) => ({
        ...stationConfig,
        forecast: null as null,
        abbreviatedForecast: null as null,
        highTemp: null as null,
        lowTemp: null as null,
      }))
    );

    // loop through stations and get current conditions for them
    stations.forEach((station) => this.fetchWeatherForStation(station, observations));
  }

  private fetchWeatherForStation(station: SunspotStationConfig, observations: SunspotStationObservations) {
    axios
      .get(`https://api.weather.gov/gridpoints/${station.code}/${station.x},${station.y}/forecast`)
      .then((resp) => {
        const { data: weather } = resp;
        if (!weather) throw "Unable to parse sunspot weather data";

        const stationIx = observations.findIndex((observationStation) => observationStation.code === station.code);
        if (stationIx === -1) return;

        const { properties } = weather ?? {};
        const { periods } = properties ?? {};
        // get the forecast info
        if (!periods?.length) return;
        const [period1, period2, period3] = periods || [];

        // use isDaytime: true item for forecast/hi
        const day = period1.isDaytime ? period1 : period2;
        const night = period1.isDaytime ? period2 : period3;

        const forecastText = day.shortForecast;
        const hiTemp = convertFToC(day.temperature);
        const loTemp = convertFToC(night.temperature);

        observations.splice(stationIx, 1, {
          ...station,
          forecast: forecastText,
          abbreviatedForecast: harshTruncateConditions(forecastText, 12, true),
          highTemp: hiTemp,
          lowTemp: loTemp,
        });
      })
      .catch(() => logger.error(station.name, "failed to fetch data"));
  }

  public sunspots() {
    // when we return we should filter down to just reporting stations, and then limit each one
    return this._sunspotStations.filter((stationObservation) => this.isStationReporting(stationObservation));
  }
}

let sunspots: Sunspots = null;
export function initializeSunspots(): Sunspots {
  if (process.env.NODE_ENV === "test") return new Sunspots();
  if (sunspots) return sunspots;

  sunspots = new Sunspots();
  return sunspots;
}
