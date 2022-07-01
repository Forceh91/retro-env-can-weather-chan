const xmljs = require("xml-js");
const axios = require("axios");
const { isWinterSeason, isDateInCurrentWinterSeason, getShorthandMonthNamesForSeason } = require("./date-utils");

// this is loaded from config but here's a backup for it
const STATION_ID_TO_FETCH = 27174; // winnipeg a cs//51097; // winnipeg intl a
const HISTORICAL_DATA_URL =
  "https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=$STATION_ID&Year=$YEAR&time=&timeframe=2";

let lastYearObservations = null;
let seasonPrecipData = null;
let seasonPrecipNormals = null;
function fetchHistoricalData(stationID) {
  fetchClimateNormals();

  stationID = stationID || STATION_ID_TO_FETCH;

  // fill in the station id
  let url = HISTORICAL_DATA_URL.replace("$STATION_ID", STATION_ID_TO_FETCH);

  // get the starting year for this place
  const today = new Date();
  const lastYear = today.getFullYear() - 1;

  // place to store two years worth of data
  const combinedStationData = [];
  const promises = [];
  let dataPromise = null;

  // go through each year and fetch all of its data
  for (let currentYear = lastYear; currentYear <= today.getFullYear(); currentYear++) {
    // now we can fetch the result
    dataPromise = axios
      .get(url.replace("$YEAR", currentYear))
      .then((resp) => {
        const data = resp.data;
        if (!data) return;

        // convert to js object
        const historicalData = xmljs.xml2js(data, { compact: true });
        if (!historicalData) return;

        // check it has climate data
        const climateData = historicalData.climatedata;
        if (!climateData) return;

        // check it has station data
        const stationData = climateData.stationdata;
        if (!stationData || !stationData.length) return;

        // keep track of this outside of this call
        combinedStationData.push(...stationData);
      })
      .catch(() => {
        console.warn(
          "[HISTORICAL]",
          "Failed to fetch historical data for station",
          STATION_ID_TO_FETCH,
          "on year",
          currentYear
        );
      });

    promises.push(dataPromise);
  }

  Promise.allSettled(promises).then(() => {
    // since we have two years worth of data here we need to find this date but last year
    // so we can get what the last year observations were
    const stationDataTodayLastYear = combinedStationData.find(
      (sd) =>
        parseInt(sd._attributes.day) === today.getDay() &&
        parseInt(sd._attributes.month) === today.getMonth() + 1 &&
        parseInt(sd._attributes.year) === lastYear
    );

    // store it if we find it
    if (today)
      lastYearObservations = {
        temp: { min: stationDataTodayLastYear.mintemp._text, max: stationDataTodayLastYear.maxtemp._text },
      };

    // now we're going to figure out precip data for the current season
    const pad = (val) => (val < 10 ? `0${val}` : val);

    // by looping through an entire two years worth of data (:
    const precipData = [];
    combinedStationData.forEach((station) => {
      const date = `${parseInt(station._attributes.year)}-${pad(parseInt(station._attributes.month))}-${pad(
        parseInt(station._attributes.day)
      )}`;

      // if we're not in winter season we need to make sure we fetch data for this year
      const isThisYear = parseInt(station._attributes.year) === today.getFullYear();

      // if its summer we get rainfall, if its winter we get snowfall
      if (isWinterSeason && isDateInCurrentWinterSeason(date))
        precipData.push(parseFloat(station.totalprecipitation?._text || 0));
      else isThisYear && precipData.push(parseFloat(station.totalprecipitation?._text || 0));
    });

    // now store the total precip for the current season
    const totalPrecipForCurrentSeason = precipData.reduce((acc, curr) => (acc += curr), 0);
    seasonPrecipData = totalPrecipForCurrentSeason;
  });
}

function fetchClimateNormals() {
  // this is winnipeg richardson intl a
  // TODO: make this a config option
  const STATION_ID = 3698;
  const CLIMATE_ID = 5023222;
  const PROVINCE = "MB";

  // base url
  let url =
    "https://climate.weather.gc.ca/climate_normals/bulk_data_e.html?ffmt=xml&lang=e&prov=$PROVINCE&yr=1981&stnID=$STATION_ID&climateID=$CLIMATE_ID";
  url = url
    .replace(/\$PROVINCE/gi, PROVINCE)
    .replace(/\$STATION_ID/gi, STATION_ID)
    .replace(/\$CLIMATE_ID/gi, CLIMATE_ID);

  axios
    .get(url)
    .then((resp) => {
      const data = resp.data;
      if (!data) return;

      // convert to js object
      const climateNormals = xmljs.xml2js(data, { compact: true });
      if (!climateNormals) return;

      const parentCollection = climateNormals["om:ObservationCollection"];
      if (!parentCollection) return;

      const observationsParent = parentCollection["om:member"]["om:Observation"];
      if (!observationsParent) return;

      const observations = observationsParent["om:result"]?.elements?.element;
      if (!observations) return;

      // now we can finally get precip normals, we'll take average and go from there
      const precipNormals = observations.find((obs) => obs._attributes?.name === "precipitation");
      if (!precipNormals || !precipNormals.element?.length) return;

      // figure out what months we'll need
      const months = getShorthandMonthNamesForSeason(true);
      const precipDataForCurrentSeason = precipNormals.element?.filter((el) => {
        const [, monthForEl] = el._attributes?.name.split("avg_rnfl_");
        return months.includes(monthForEl);
      });

      const normalPrecipForCurentSeason = precipDataForCurrentSeason
        .map((pcp) => parseFloat(pcp._attributes?.value || 0))
        .reduce((acc, curr) => (acc += curr), 0);
      seasonPrecipNormals = normalPrecipForCurentSeason;
    })
    .catch((e) => {
      console.log("[CLIMATE NORMALS] Failed to fetch climate normals", e);
    });
}

function lastYearObservation() {
  return lastYearObservations;
}

function getSeasonPrecipData() {
  return seasonPrecipData;
}

function getSeasonPrecpNormalsData() {
  return seasonPrecipNormals;
}

module.exports = { fetchHistoricalData, lastYearObservation, getSeasonPrecipData, getSeasonPrecpNormalsData };
