const axios = require("axios");
const Weather = require("ec-weather-js");
const { addMinutes } = require("date-fns");

const { convertECCDateStringToDateObject } = require("./date-utils");
const { getAQHIObservation } = require("./aqhi-observation");
const { getHotColdSpotsCanada } = require("./province-today-observation.js");
const CURRENT_CONDITIONS_FETCH_INTERVAL = 5 * 60 * 1000;

let currentConditionsLocation = null;
let historicalData = null;
const conditions = {
  observed: {
    unixTimestamp: 0,
    localTime: null,
    stationTime: null,
  },
  city: null,
  conditions: null,
  riseSet: null,
  forecast: null,
  regionalNormals: null,
  conditionID: null,
};

const initCurrentConditions = (primaryLocation, app, historicalDataAPI) => {
  // pass in the primary location from the config and make sure its valid
  if (!primaryLocation || !primaryLocation.province || !primaryLocation.location) return;

  // store this for later use
  currentConditionsLocation = { ...primaryLocation };
  historicalData = historicalDataAPI;

  // setup a timer to fetch the conditions periodically (ECC updates this roughly once every 30mins)
  // we will fetch data once every 5 minutes or so
  setInterval(fetchCurrentConditions, CURRENT_CONDITIONS_FETCH_INTERVAL);
  fetchCurrentConditions();

  app &&
    app.get("/api/weather", (req, res) => {
      if (!conditions.conditionID) res.sendStatus(500);
      else res.send(generateWeatherResponse());
    });
};

const reloadCurrentConditions = (location) => {
  if (!location) return;
  currentConditionsLocation = { ...location };
  fetchCurrentConditions();
};

const getStationLastObservedDateTime = () => {
  // we'll use this in future methods when retrieving historical data to stop things being
  // weirdly timezoned and data being inaccurate to what was actually sent over last
  return conditions.observed.stationTime;
};

const fetchCurrentConditions = () => {
  if (!currentConditionsLocation) return;

  const previousConditionsID = conditions.conditionID;

  const { province, location } = currentConditionsLocation;
  axios.get(`https://dd.weather.gc.ca/citypage_weather/xml/${province}/${location}_e.xml`).then((resp) => {
    const weather = new Weather(resp.data);
    if (!weather) return;

    // all: almanac, riseset, location, yesterday
    const allWeatherData = weather.all;
    if (!allWeatherData) return;

    // generate some objects so the FE has less work to do once it receives the data
    const observedDateObject = generateConditionsObserved(weather.current?.dateTime[1]);
    const city = generateObservedCity(allWeatherData.location);
    const observedConditions = generateConditions(weather.current);
    const sunRiseSet = generateSunriseSet(allWeatherData.riseSet?.dateTime);
    const almanac = generateAlmanac(allWeatherData.almanac);
    const windchill = generateWindchill(observedConditions);

    // place these into the global conditions object we have that can be used elsewhere
    conditions.city = city;
    conditions.observed = observedDateObject;
    conditions.conditions = observedConditions;
    conditions.riseSet = sunRiseSet;
    conditions.forecast = weather.weekly;
    conditions.regionalNormals = weather.all.regionalNormals;
    conditions.almanac = almanac;
    conditions.windchill = windchill;
    conditions.conditionID = generateConditionsUniqueID(weather.current?.dateTime[1]);

    // if the conditions ID has updated this means new info is available which means we should fetch more historical data
    if (conditions.conditionID !== previousConditionsID) historicalData && historicalData.fetchHistoricalData();
  });
};

const generateConditionsObserved = (date) => {
  if (!date) return;

  // create a date object for when this was observed on the local machine
  const localTime = convertECCDateStringToDateObject(date.textSummary);

  // now we need to calculate the time at the station based off what it says the utc offset is
  // and what the utc offset is for the local time. the date object will show as the local timezone
  // because timezones aren't a thing we can change. it will just move the time (and date) back the correct amount
  // the offset in JS is given in minutes
  const localOffset = -localTime.getTimezoneOffset();

  // so we need to transfer the offset in hours to minutes
  // then mush them together and create an offset from local
  const stationUTCOffset = parseInt(date.UTCOffset) * 60;
  const offsetFromLocalTime = stationUTCOffset - localOffset;

  // create the station time (remember this will be in the local timezone, just with the hour adjusted)
  const stationTime = addMinutes(localTime, offsetFromLocalTime);
  return {
    localTime,
    localTimeInSeconds: localTime.getTime() / 1000,
    stationTime,
    stationTimeInSeconds: stationTime.getTime() / 1000,
    stationTimezone: date.zone,
  };
};

const generateObservedCity = (location) => {
  const { name } = location;
  const { value } = name || {};
  return value;
};

const generateConditions = (conditions) => {
  const { condition, pressure, relativeHumidity, temperature, visibility, wind } = conditions || {};
  return { condition, pressure, relativeHumidity, temperature, visibility, wind };
};

const generateSunriseSet = (riseset) => {
  const riseSetData = { rise: null, set: null };

  // station sunrise time
  const stationRiseTimeObj = riseset.find((data) => data.name === "sunrise" && data.zone !== "UTC");
  if (stationRiseTimeObj) {
    let time = convertECCDateStringToDateObject(stationRiseTimeObj.textSummary);
    riseSetData.rise = { time, timeInSeconds: time.getTime() / 1000 };
  }

  // station sunset time
  const stationSetTimeObj = riseset.find((data) => data.name === "sunset" && data.zone !== "UTC");
  if (stationSetTimeObj) {
    let time = convertECCDateStringToDateObject(stationSetTimeObj.textSummary);
    riseSetData.set = { time, timeInSeconds: time.getTime() / 1000 };
  }

  // again remember that whilst the date object has a timezone of whatever the local machine is set to
  // the date object/unix seconds is pointing to a time that is at the station, JS doesn't do timezones well
  return riseSetData;
};

const generateAlmanac = (almanac) => {
  // we need to fetch the historical values from the historical data at this point, we will use the current observed date
  // to fetch the historical data, rather than the current time value so that data doesn't get muddled up
  // where it was showing normal/record from observed, and and the last year from the current date/time
  return almanac;
};

const generateWindchill = (conditions) => {
  const { temperature, wind } = conditions;

  // get temp val
  const tempVal = temperature && temperature.value;
  if (isNaN(tempVal)) return 0;

  // get wind speed val
  const windVal = wind && wind.speed?.value;
  if (isNaN(windVal)) return 0;

  // the old windchill system was a number based off temp and wind speed, rather than just a random temp
  // this is calculated as below, then rounded up to the nearest 50, if its >= 1350 then windchill should be shown
  const tempAsFloat = parseFloat(tempVal);
  const windSpeed = parseInt(windVal);
  const windSpeedMs = windSpeed / 3.6;

  const windchill = Math.floor(
    (12.1452 + 11.6222 * Math.sqrt(windSpeedMs) - 1.16222 * windSpeedMs) * (33 - tempAsFloat)
  );

  // round it to nearest 50 and if its >= 1200 with a windspeed >= 10 its relevant
  const roundedWindchill = Math.round(windchill / 50) * 50;
  return roundedWindchill >= 1200 && windSpeed >= 10 ? roundedWindchill : 0;
};

const generateConditionsUniqueID = (date) => {
  // this generates a unique id for the conditions update that we can refer back to
  // for now we'll just use the timestamp that the data returned for the stations time
  if (!date) return null;
  return date.timeStamp;
};

const generateWeatherResponse = () => {
  return {
    ...conditions,
    almanac: { ...conditions.almanac, lastYear: (historicalData && historicalData.lastYearObservation()) || {} },
    canadaHotColdSpots: getHotColdSpotsCanada(),
    airQuality: getAQHIObservation(),
  };
};

module.exports = { initCurrentConditions, getStationLastObservedDateTime, reloadCurrentConditions };
