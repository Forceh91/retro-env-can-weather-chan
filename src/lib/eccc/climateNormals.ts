import axios from "lib/backendAxios";
import { format, getDaysInMonth, isValid, subMonths } from "date-fns";
import { initializeConfig } from "lib/config";
import { getShorthandMonthNamesForSeason, isStartOfMonth } from "lib/date";
import Logger from "lib/logger";
import { ECCCClimateNormalElement, ClimateNormalSeasonPrecip, ClimateNormalsForMonth } from "types";
import { ElementCompact, xml2js } from "xml-js";

const logger = new Logger("Climate_Normals");
const config = initializeConfig();

class ClimateNormals {
  private _apiURL: string;
  private _lastMonthName: string;
  private _normalPrecipForSeason: ClimateNormalSeasonPrecip = { amount: 0, unit: "mm" };
  private _normalsForLastMonth: ClimateNormalsForMonth = { temperature: { min: 0, max: 0 }, precip: { amount: 0 } };

  constructor() {
    if (!config) return;

    logger.log("Initializing climate normals for station ID:", config.climateNormals.stationID);
    this._apiURL = `https://climate.weather.gc.ca/climate_normals/bulk_data_e.html?ffmt=xml&lang=e&prov=${config.climateNormals.province}&yr=1981&stnID=${config.climateNormals.stationID}&climateID=${config.climateNormals.climateID}`;
  }

  public fetchClimateNormals(currentDate: Date = new Date()) {
    // store last month name for later use
    this._lastMonthName = format(subMonths(currentDate, 1), "MMM").toLowerCase();

    logger.log("Fetching climate normals");

    // fetch climate normals
    axios
      .get(this._apiURL)
      .then((resp) => {
        const { data } = resp ?? {};
        if (!data) throw "No data";

        // convert the xml to js
        const climateNormals: ElementCompact = xml2js(data, { compact: true });
        if (!climateNormals) return;

        // make our way all the way down to where they store the actual data
        const parentCollection = climateNormals["om:ObservationCollection"];
        if (!parentCollection) return;

        const observationsParent = parentCollection["om:member"]["om:Observation"];
        if (!observationsParent) return;

        const observations = observationsParent["om:result"]?.elements?.element;
        if (!observations) return;

        // get the precip data
        this.parsePrecipNormals(
          currentDate,
          observations.find((observation: any) => observation._attributes?.name === "precipitation")?.element
        );

        // get the temp data
        this.parseTempNormals(
          currentDate,
          observations.find((observation: any) => observation._attributes?.name === "temperature")?.element
        );
      })
      .catch((err) => logger.error("Failed to fetch historical normals", err))
      .finally(() => logger.log("Fetched climate normals"));
  }

  private parsePrecipNormals(currentDate: Date, precipData: ECCCClimateNormalElement[]) {
    if (!precipData?.length || !isValid(currentDate)) return;

    // first we can process the normal precip amount for the current season
    // which we'll need the shorthand month names for
    const seasonMonths = getShorthandMonthNamesForSeason(true);
    const seasonalPrecipElements = precipData.filter((precipElement) => {
      const [, elementMonth] = precipElement._attributes?.name.split("avg_pcpn_");
      return seasonMonths.includes(elementMonth);
    });

    // now that we have these we can calculate the normal precip for the current season
    let normalPrecipForSeason = 0;
    const currentMonth = seasonMonths[seasonMonths.length - 1];
    seasonalPrecipElements.forEach((seasonPrecipElement) => {
      const precipAmount = Number(seasonPrecipElement._attributes?.value);

      // if we're looking at the current month we need to do math to get the average amount for a day and use that
      if (seasonPrecipElement._attributes?.name.includes(currentMonth)) {
        // if we're not past day 1 yet then don't need to change the precip amount
        if (currentDate.getDate() === 1) return;

        // calculate average based off amount and days in month and add that
        const averageDailyPrecipForCurrentMonth = precipAmount / getDaysInMonth(currentDate);
        normalPrecipForSeason += averageDailyPrecipForCurrentMonth * (currentDate.getDate() - 1);
      } // otherwise just add on the value
      else normalPrecipForSeason += precipAmount;
    });

    // store this for reference later on
    this._normalPrecipForSeason.amount = Number(normalPrecipForSeason.toFixed(1));

    logger.log("Processed normal precip for season");

    // get the normal precip for last month
    const lastMonthAveragePrecip: ECCCClimateNormalElement = precipData.find(
      (precipElement) => precipElement._attributes?.name === `avg_pcpn_${this._lastMonthName}`
    );

    // and store if it existed
    if (lastMonthAveragePrecip)
      this._normalsForLastMonth.precip.amount = Number(
        Number(lastMonthAveragePrecip._attributes?.value ?? "0").toFixed(1)
      );

    logger.log("Processed normal precip for last month", this._lastMonthName);
  }

  private parseTempNormals(currentDate: Date, tempData: ECCCClimateNormalElement[]) {
    if (!tempData?.length || !isValid(currentDate)) return;

    // now get the min/max temps for last month from the temp data
    const maxTempElement = tempData.find(
      (tempDataElement) => tempDataElement._attributes.name === `max_temp_dly_${this._lastMonthName}`
    );
    const minTempElement = tempData.find(
      (tempDataElement) => tempDataElement._attributes.name === `min_temp_dly_${this._lastMonthName}`
    );

    // and store to the normals
    this._normalsForLastMonth.temperature.max = Number(maxTempElement?._attributes.value);
    this._normalsForLastMonth.temperature.min = Number(minTempElement?._attributes.value);

    logger.log("Processed normal min/max temps for last month", this._lastMonthName);
  }

  public getNormalPrecipForCurrentSeason() {
    return this._normalPrecipForSeason;
  }

  public getNormalsForLastMonth(date: Date = new Date()) {
    if (isStartOfMonth(date)) return this._normalsForLastMonth;
    return null;
  }
}

let climateNormals: ClimateNormals = null;
export function initializeClimateNormals(forceNewInstance: boolean = false): ClimateNormals {
  if (!forceNewInstance && climateNormals) return climateNormals;

  climateNormals = new ClimateNormals();
  return climateNormals;
}
