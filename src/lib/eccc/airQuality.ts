import { EVENT_BUS_CONFIG_CHANGE_AIR_QUALITY_STATION } from "consts";
import axios from "lib/backendAxios";
import { initializeConfig } from "lib/config";
import eventbus from "lib/eventbus";
import Logger from "lib/logger";
import { AQHIObservation } from "types";
import { ElementCompact, xml2js } from "xml-js";

const config = initializeConfig();
const logger = new Logger("AQHI");
const AIR_QUALITY_FETCH_INTERVAL = 10 * 60 * 1000;

class AirQuality {
  private _apiURL = "";
  private _aqhiObservation: AQHIObservation = null;

  constructor() {
    this.initialize();
    setInterval(() => this.fetchAirQuality(), AIR_QUALITY_FETCH_INTERVAL);
    eventbus.addListener(EVENT_BUS_CONFIG_CHANGE_AIR_QUALITY_STATION, () => this.initialize());
  }

  private initialize() {
    if (!config || !config.airQualityStation) return;

    const [area, stationCode] = config.airQualityStation.split("/");

    this._apiURL = `http://dd.weather.gc.ca/air_quality/aqhi/${area}/observation/realtime/xml/AQ_OBS_${stationCode}_CURRENT.xml`;
    logger.log("Air quality will be tracked");

    this.fetchAirQuality();
  }

  private fetchAirQuality() {
    logger.log("Fetching latest AQHI observation");
    // clear the observation incase data no longer exists on eccc
    this.clearAirQualityObservation();

    axios
      .get(this._apiURL)
      .then((resp) => {
        const { data } = resp;
        if (!data) throw "Invalid response";

        // convert xml to js object
        const aqhiObservationXML: ElementCompact = xml2js(data, { compact: true });
        if (!aqhiObservationXML) return;

        // drill down into it to get the data we're after
        const conditionAirQuality: ElementCompact = aqhiObservationXML["conditionAirQuality"];
        if (!conditionAirQuality) return;

        // set the aqhi observation back up
        this._aqhiObservation = { day: null, month: null, hour: null, isPM: false, value: null };

        // day/month info
        this._aqhiObservation.day = Number(conditionAirQuality["dateStamp"]["day"]?._text);
        this._aqhiObservation.month = Number(conditionAirQuality["dateStamp"]["month"]?._text);

        // hour info
        const hour: ElementCompact = conditionAirQuality["dateStamp"]["hour"];
        this._aqhiObservation.hour = Number(hour?._text);
        this._aqhiObservation.isPM = hour?._attributes?.ampm === "PM";

        // aqhi reading
        this._aqhiObservation.value = Number(conditionAirQuality["airQualityHealthIndex"]._text);

        logger.log("AQHI observation updated");
      })
      .catch((e) => {
        logger.error("Failed to fetch AQHI observation", e);
      });
  }

  private clearAirQualityObservation() {
    this._aqhiObservation = null;
  }

  public get observation() {
    return this._aqhiObservation;
  }
}

let airQuality: AirQuality = null;
export function initializeAirQuality(): AirQuality {
  if (process.env.NODE_ENV === "test") return new AirQuality();
  if (airQuality) return airQuality;

  airQuality = new AirQuality();
  return airQuality;
}
