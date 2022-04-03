const xmljs = require("xml-js");
const axios = require("axios");

// TODO: Make this a config option somehow
const STATION_ID_TO_FETCH = 51097; // winnipeg intl a
const HISTORICAL_DATA_URL =
  "https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=$STATION_ID&Year=$YEAR&time=&timeframe=2";

let lastYearObservations = null;
function fetchLastYearObservation() {
  // fill in the station id
  let url = HISTORICAL_DATA_URL.replace("$STATION_ID", STATION_ID_TO_FETCH);

  // and the date (month is 0 indexed in JS)
  const today = new Date();
  const date = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear() - 1;
  url = url
    .replace("$YEAR", year)
    .replace("$MONTH", month)
    .replace("$DAY", date);

  // now we can fetch the result
  axios
    .get(url)
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

      // for whatever reason we can't get _just_ the day we asked for and we get the entire year
      // so we need to go find it
      const today = stationData.find(
        (sd) =>
          parseInt(sd._attributes.day) === date &&
          parseInt(sd._attributes.month) === month &&
          parseInt(sd._attributes.year) === year
      );
      if (!today) return;

      // now we can set the observations for last year
      lastYearObservations = { temp: { min: today.mintemp._text, max: today.maxtemp._text } };
    })
    .catch(() => {
      console.warn("[HISTORICAL]", "Failed to fetch historical data for station %s", STATION_ID_TO_FETCH);
    });
}

function lastYearObservation() {
  return lastYearObservations;
}

module.exports = { fetchLastYearObservation, lastYearObservation };
