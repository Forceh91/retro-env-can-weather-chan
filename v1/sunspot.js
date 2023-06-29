const axios = require("axios");
const { isSunSpotSeason } = require("./date-utils");

const sunspotCities = [
  { name: "Honolulu", stationCode: "HFO", x: 150, y: 145 },
  { name: "Phoenix", stationCode: "PSR", x: 160, y: 56 },
  { name: "Brownsville", stationCode: "BRO", x: 80, y: 5 },
  { name: "Orlando", stationCode: "MLB", x: 28, y: 69 },
  { name: "San Diego", stationCode: "SGX", x: 55, y: 14 },
  { name: "Key West", stationCode: "KEY", x: 61, y: 47 },
  { name: "San Juan", stationCode: "SJU", x: 170, y: 129 },
];

const latestSunspotForecasts = [];

function fetchForecastForSunspotCities() {
  if (!isSunSpotSeason()) return latestSunspotForecasts.splice(0, latestSunspotForecasts.length);

  const results = [
    ...sunspotCities.map((station) => ({ ...station, forecastText: null, hiTemp: Math.min(), loTemp: Math.max() })),
  ];
  const promises = [];
  sunspotCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://api.weather.gov/gridpoints/${station.stationCode}/${station.x},${station.y}/forecast`)
        .then((resp) => {
          const data = resp && resp.data;
          if (!data) return;

          addForecastForSunspot(results, station, data);
        })
        .catch(() => {
          console.warn("[SUNSPOT]", station.name, "failed to fetch data");
          addForecastForSunspot(results, station, {});
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    latestSunspotForecasts.splice(0, latestSunspotForecasts.length, ...results);
  });
}

function addForecastForSunspot(results, stationObj, data) {
  const { properties } = data || {};
  const { periods } = properties || {};

  // find the station in our results obj
  const ix = results.findIndex((rStation) => rStation.stationCode === stationObj.stationCode);
  if (ix === -1) return;

  // get the forecast info
  if (!periods || !periods.length) return;
  const [period1, period2, period3] = periods || [];

  // use isDaytime: true item for forecast/hi
  const day = period1.isDaytime ? period1 : period2;
  const night = period1.isDaytime ? period2 : period3;

  const forecastText = day.shortForecast;
  const hiTemp = convertFToC(day.temperature);
  const loTemp = convertFToC(night.temperature);

  // edit the results with this new data
  results[ix] = { ...results[ix], forecastText, hiTemp, loTemp };
}

function convertFToC(f) {
  return parseInt(((f - 32) * 5) / 9);
}

module.exports = { fetchForecastForSunspotCities, addForecastForSunspot, convertFToC, latestSunspotForecasts };
