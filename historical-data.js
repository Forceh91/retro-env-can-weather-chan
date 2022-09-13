const xmljs = require("xml-js");
const axios = require("axios");
const {
  subMonths,
  startOfMonth,
  endOfMonth,
  compareAsc,
  compareDesc,
  parseISO,
  format,
  getDaysInMonth,
} = require("date-fns");

const {
  isWinterSeason,
  isDateInCurrentWinterSeason,
  isDateInCurrentSummerSeason,
  getShorthandMonthNamesForSeason,
  isStartOfMonth,
} = require("./date-utils");

const { getStationLastObservedDateTime } = require("./current-conditions");

// this is loaded from config but here's a backup for it
const STATION_ID_TO_FETCH = 27174; // winnipeg a cs//51097; // winnipeg intl a
const HISTORICAL_DATA_URL =
  "https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=$STATION_ID&Year=$YEAR&time=&timeframe=2";

let lastYearObservations = null;
let seasonPrecipData = null;
let seasonPrecipNormals = null;
let lastMonthSummary = false;

function initHistoricalData(climateStationID) {
  fetchHistoricalData(climateStationID);
  setInterval(() => fetchHistoricalData(climateStationID), 5 * 60 * 1000);
}

const pad = (val) => (val < 10 ? `0${val}` : val);

function fetchHistoricalData(stationID) {
  fetchClimateNormals();

  stationID = stationID || STATION_ID_TO_FETCH;

  // fill in the station id
  let url = HISTORICAL_DATA_URL.replace("$STATION_ID", STATION_ID_TO_FETCH);

  // use the current conditions observed data to decide what date to use for historical temp data
  const today = getStationLastObservedDateTime();
  if (!today) return;

  // get the starting year for this place
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
        parseInt(sd._attributes.day) === today.getDate() &&
        parseInt(sd._attributes.month) === today.getMonth() + 1 &&
        parseInt(sd._attributes.year) === lastYear
    );

    // store it if we find it
    if (today)
      lastYearObservations = {
        temp: { min: stationDataTodayLastYear.mintemp._text, max: stationDataTodayLastYear.maxtemp._text },
      };

    // now we're going to figure out precip data for the current season
    // by looping through an entire two years worth of data (:
    const precipData = [];
    combinedStationData.forEach((station) => {
      const date = `${parseInt(station._attributes.year)}-${pad(parseInt(station._attributes.month))}-${pad(
        parseInt(station._attributes.day)
      )}`;

      // if we're not in winter season we need to make sure we fetch data for this year
      const isThisYear = parseInt(station._attributes.year) === today.getFullYear();

      // if its summer we get rainfall, if its winter we get snowfall
      if (isWinterSeason() && isDateInCurrentWinterSeason(date))
        precipData.push(parseFloat(station.totalprecipitation?._text || 0));
      else if (!isWinterSeason() && isDateInCurrentSummerSeason(date) && isThisYear)
        precipData.push(parseFloat(station.totalprecipitation?._text || 0));
    });

    // now store the total precip for the current season
    const totalPrecipForCurrentSeason = precipData.reduce((acc, curr) => (acc += curr), 0);
    seasonPrecipData = totalPrecipForCurrentSeason.toFixed(1);

    // figure out a last month summary
    getSummaryOfLastMonth(combinedStationData);
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
        const [, monthForEl] = el._attributes?.name.split("avg_pcpn_");
        return months.includes(monthForEl);
      });

      // and generate the total precip for the current season
      const normalPrecipForCurentSeason = precipDataForCurrentSeason
        .map((pcp) => {
          const precipAmount = parseFloat(pcp._attributes?.value || 0);
          // for the current month we need to do math
          if (pcp._attributes?.name.includes(months[months.length - 1])) {
            // if we're past the 1st day of the month, otherwise return 0
            const date = getStationLastObservedDateTime() || new Date();
            const daysInMonth = getDaysInMonth(date);
            if (date.getDate() > 1 && daysInMonth) {
              // get the value and divide by daysInMonth to get average per day for this month
              const averagePerDay = precipAmount / daysInMonth;
              const averageForMonthUntilYesterday = averagePerDay * (date.getDate() - 1);
              return averageForMonthUntilYesterday;
            }

            // not past the first day so return 0
            return 0;
          }

          return precipAmount;
        })
        .reduce((acc, curr) => (acc += curr), 0);
      seasonPrecipNormals = normalPrecipForCurentSeason.toFixed(1);

      // get the normals for the previous month
      const tempNormals = observations.find((obs) => obs._attributes?.name === "temperature");
      if (!tempNormals || !tempNormals.element?.length) return;

      getSummaryOfLastMonthNormals(tempNormals.element, precipNormals.element);
    })
    .catch((e) => {
      console.log("[CLIMATE NORMALS] Failed to fetch climate normals", e);
    });
}

function getSummaryOfLastMonth(stationData) {
  // no point doing this if it's past day 5 really
  if (!isStartOfMonth()) return (lastMonthSummary = false);

  // get start/end of last month
  const date = getStationLastObservedDateTime() || new Date();
  const startOfLastMonth = startOfMonth(subMonths(date, 1));
  const endOfLastMonth = endOfMonth(startOfLastMonth);

  // get the data for the last month from our station data
  const dataForLastMonth = stationData.filter((station) => {
    const date = `${parseInt(station._attributes.year)}-${pad(parseInt(station._attributes.month))}-${pad(
      parseInt(station._attributes.day)
    )}`;

    return compareDesc(startOfLastMonth, parseISO(date)) !== -1 && compareAsc(endOfLastMonth, parseISO(date)) !== -1;
  });

  // now we have all of the data for the last month we need to get the following:
  // average high/low, precip (mm) / snowfall(cm), warmest day (temp+day), coldest day (temp+day)
  const highTemps = [];
  const lowTemps = [];
  const precipValues = [];
  dataForLastMonth.forEach((station) => {
    const day = station._attributes?.day;
    highTemps.push({ day, temp: parseFloat(station.maxtemp?._text || 0) });
    lowTemps.push({ day, temp: parseFloat(station.mintemp?._text || 0) });
    precipValues.push({ day, precip: parseFloat(station.totalprecipitation?._text || 0) });
  });

  // now we can calculate the average high/low, and total precip
  const averageHigh = highTemps.reduce((acc, curr) => (acc += curr.temp), 0) / highTemps.length;
  const averageLow = lowTemps.reduce((acc, curr) => (acc += curr.temp), 0) / lowTemps.length;
  const totalPrecip = precipValues.reduce((acc, curr) => (acc += curr.precip), 0);
  const warmestDay = Math.max(...highTemps.map((ht) => ht.temp));
  const coldestDay = Math.min(...lowTemps.map((lt) => lt.temp));

  // store this as actual data
  if (!lastMonthSummary) lastMonthSummary = {};
  lastMonthSummary.actual = {
    averageHigh: averageHigh.toFixed(1),
    averageLow: averageLow.toFixed(1),
    totalPrecip: totalPrecip.toFixed(1),
    warmestDay: highTemps.find((ht) => ht.temp === warmestDay),
    coldestDay: lowTemps.find((lt) => lt.temp === coldestDay),
  };
}

function getSummaryOfLastMonthNormals(normalTemps, normalPrecip) {
  // no point doing this if it's past day 5 really
  if (!isStartOfMonth()) return (lastMonthSummary = false);

  // get the month name for last month
  const date = new Date();
  const monthName = format(subMonths(date, 1), "MMM").toLowerCase();

  const averagePrecipElement = normalPrecip.find((e) => e._attributes?.name === `avg_pcpn_${monthName}`);
  const averagePrecip = (averagePrecipElement && parseFloat(averagePrecipElement._attributes?.value || 0)) || 0;

  const maxTempElement = normalTemps.find((e) => e._attributes?.name === `max_temp_dly_${monthName}`);
  const maxTemp = (maxTempElement && parseFloat(maxTempElement._attributes?.value || 0)) || 0;

  const minTempElement = normalTemps.find((e) => e._attributes?.name === `min_temp_dly_${monthName}`);
  const minTemp = (minTempElement && parseFloat(minTempElement._attributes?.value || 0)) || 0;

  // store this as actual data
  if (!lastMonthSummary) lastMonthSummary = {};
  lastMonthSummary.normal = {
    normalHigh: maxTemp.toFixed(1),
    normalLow: minTemp.toFixed(1),
    normalPrecip: averagePrecip.toFixed(1),
  };
}

function lastYearObservation() {
  return lastYearObservations;
}

function getSeasonPrecipData() {
  return seasonPrecipData;
}

function getSeasonPrecipNormalsData() {
  return seasonPrecipNormals;
}

function getLastMonthSummary() {
  if (lastMonthSummary) lastMonthSummary.month = format(subMonths(Date.now(), 1), "MMMM");
  return lastMonthSummary;
}

module.exports = {
  initHistoricalData,
  fetchHistoricalData,
  lastYearObservation,
  getSeasonPrecipData,
  getSeasonPrecipNormalsData,
  getLastMonthSummary,
};
