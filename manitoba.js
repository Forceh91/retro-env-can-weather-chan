// keeps track of set stations around manitoba and what the min/max was for the
// current time period. (if the app isnt running the data may be inaccurate)
// 8am - 8pm it tracks the max temp and displays the min temp
// 8pm - 8am it tracks the min temp and display the max temp

const fs = require("fs");
const axios = require("axios");
const Weather = require("ec-weather-js");
const FOLDER_NAME = "db";
const FILE_NAME = "manitoba.json";

const manitobaCities = [
  { name: "Winnipeg", stationCode: "MB/s0000193" },
  { name: "Portage", stationCode: "MB/s0000626" },
  { name: "Brandon", stationCode: "MB/s0000492" },
  { name: "Dauphin", stationCode: "MB/s0000508" },
  { name: "Kenora", stationCode: "ON/s0000651" },
  { name: "Thompson", stationCode: "MB/s0000695" },
];

const stationTracking = [
  // math.max returns -Infinity, and math.min returns Infinity
  ...manitobaCities.map((city) => ({
    ...city,
    max_temp: Math.max(),
    min_temp: Math.min(),
    display_temp: null,
    yesterday_precip: null,
  })),
];

let currentDisplayValue = "";

const initManitobaTracking = () => {
  loadManitobaTracking();

  setInterval(updateManitobaStations, 5 * 60 * 1000);
  updateManitobaStations();
};

const resetTrackingAndDisplayValue = (oldVal, newVal) => {
  if (!oldVal) oldVal = "min_temp";

  // if min_temp was displayed, we need to reset this and show max
  // if max_temp was displayed, we need to reset this and show min
  stationTracking.forEach((station) => {
    // if its showing (-)Infinity then set the display temp to null
    let valueToDisplay = station[newVal];
    if (valueToDisplay === Math.min() || valueToDisplay === Math.max()) valueToDisplay = "M";

    // set the display temp to the new value
    station.display_temp = valueToDisplay;

    // reset the other value we were tracking back to min/max
    station[oldVal] = oldVal === "min_temp" ? Math.min() : Math.max();
  });

  // store the current display value so we track the right data
  currentDisplayValue = newVal;
};

const updateManitobaStations = () => {
  const tempValueToDisplay = shouldShowMinOrMaxTemp();
  if (tempValueToDisplay !== currentDisplayValue) resetTrackingAndDisplayValue(currentDisplayValue, tempValueToDisplay);

  const promises = [];
  stationTracking.forEach((station) => {
    promises.push(
      axios
        .get(`https://dd.weather.gc.ca/citypage_weather/xml/${station.stationCode}_e.xml`)
        .then((resp) => parseStationInfo(station, resp))
        .catch(() => {
          console.warn("[MANITOBA]", station.name, "failed to fetch data");
        })
    );
  });

  Promise.allSettled(promises).then(saveManitobaTracking);
};

const parseStationInfo = (station, stationData) => {
  const data = stationData && stationData.data;
  const weather = data && new Weather(data);
  if (!weather) throw "Unable to parse weather data";

  // get yesterday conditions
  const yesterdayConditions = weather.all.yesterdayConditions;

  // store the precip amounts
  const yesterdayPrecip = yesterdayConditions && yesterdayConditions.precip;
  if (!yesterdayPrecip.value) yesterdayPrecip.value = "MISSING";

  // update it in our tracking
  if (yesterdayPrecip) station.yesterday_precip = yesterdayPrecip;

  // track the high/low temp value
  const temp = weather.current?.temperature?.value;
  if (temp > station.max_temp && currentDisplayValue !== "max_temp") station.max_temp = temp;
  if (temp < station.min_temp && currentDisplayValue !== "min_temp") station.min_temp = temp;
};

const shouldShowMinOrMaxTemp = () => {
  const time = new Date();
  const hour = time.getHours();

  // if its 8pm to 8am we need to show the max_temp from the day
  // if its 8am to 8pm we need to show the min_temp from the night
  if (hour >= 20 || hour < 8) return "max_temp";
  return "min_temp";
};

const apiResponse = () => {
  return {
    period: shouldShowMinOrMaxTemp(),
    stations: stationTracking,
  };
};

const manitobaHighLow = () => {
  return apiResponse();
};

const saveManitobaTracking = () => {
  const saveObj = {
    display_value: currentDisplayValue,
    stations: stationTracking.map((station) => ({
      station_code: station.stationCode,
      min_temp: station.min_temp,
      max_temp: station.max_temp,
      display_temp: station.display_temp,
    })),
  };

  const saveFile = `${FOLDER_NAME}/${FILE_NAME}`;
  fs.writeFile(saveFile, JSON.stringify(saveObj, null, 4), "utf8", (err) => {
    if (err) console.warn("[MANITOBA] Unable to save tracking information");
    else console.log("[MANITOBA] Tracking information saved to file");
  });
};

const loadManitobaTracking = () => {
  const trackingFile = `${FOLDER_NAME}/${FILE_NAME}`;
  fs.stat(trackingFile, (err, stat) => {
    if (err || stat.size < 1) console.log("[MANITOBA] No stored tracking");
    else {
      fs.readFile(trackingFile, "utf8", (err, data) => {
        if (err) console.warn("[MANITOBA] Unable to load tracking information");
        else {
          const savedData = JSON.parse(data);
          if (!savedData) return;

          // load what value we were displaying
          if (savedData.display_value) currentDisplayValue = savedData.display_value;

          // load in the stations
          if (savedData.stations && savedData.stations.length) {
            savedData.stations.forEach((savedStation) => {
              const station = stationTracking.find((station) => station.stationCode === savedStation.station_code);
              if (!station) return;

              station.min_temp = savedStation.min_temp === null ? Math.min() : savedStation.min_temp;
              station.max_temp = savedStation.max_temp === null ? Math.max() : savedStation.max_temp;
              station.display_temp = savedStation.display_temp;
            });
          }

          console.log("[MANITOBA] Tracking information loaded from file");
        }
      });
    }
  });
};

module.exports = { initManitobaTracking, manitobaHighLow };
