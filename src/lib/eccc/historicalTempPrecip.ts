import { initializeConfig } from "lib/config";
import Logger from "lib/logger";
import axios from "axios";
import { ElementCompact, xml2js } from "xml-js";
import { HistoricalTemperatureAlmanac, WeatherStation } from "types";
import { isValid } from "date-fns";

const logger = new Logger("Historical_Temp_Precip");
const config = initializeConfig();

class HistoricalTempPrecip {
  private _apiURL: string;
  private _historicalData: any[] = [];

  private _lastYearTemperatures: HistoricalTemperatureAlmanac = { min: null, max: null };

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

  public lastYearTemperatures() {
    return this._lastYearTemperatures;
  }
}

let historicalTempPrecip: HistoricalTempPrecip = null;
export function initializeHistoricalTempPrecip(): HistoricalTempPrecip {
  if (historicalTempPrecip) return historicalTempPrecip;

  historicalTempPrecip = new HistoricalTempPrecip();
  return historicalTempPrecip;
}
