const axios = require("axios");
const Weather = require("ec-weather-js");

const manitobaCities = [
  { name: "Winnipeg", stationCode: "MB/s0000193" },
  { name: "Portage", stationCode: "MB/s0000626" },
  { name: "Brandon", stationCode: "MB/s0000492" },
  { name: "Dauphin", stationCode: "MB/s0000508" },
  { name: "Kenora", stationCode: "ON/s0000651" },
  { name: "Thompson", stationCode: "MB/s0000695" },
];

const highLowAroundMB = [];
function fetchHighLowAroundMB() {
  const results = [
    ...manitobaCities.map((station) => ({
      ...station,
      temp: null,
      temp_class: null,
      precip: {},
    })),
  ];

  const promises = [];
  manitobaCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://dd.weather.gc.ca/citypage_weather/xml/${station.stationCode}_e.xml`)
        .then((resp) => {
          const data = resp && resp.data;
          const weather = new Weather(data);
          if (!weather) throw "Unable to parse weather data";

          const resultIx = results.findIndex((s) => s.name === station.name);
          if (resultIx === -1) return;

          const immediateForecast = weather.weekly && weather.weekly[0];
          if (immediateForecast) {
            results[resultIx] = {
              ...results[resultIx],
              temp: immediateForecast.temperatures?.temperature?.value,
              temp_class: immediateForecast.temperatures?.temperature?.class,
            };
          }

          const yesterdayConditions = weather.all.yesterdayConditions;
          if (!yesterdayConditions) return;

          const yesterdayPrecip = yesterdayConditions.precip;
          if (!yesterdayPrecip) return;

          results[resultIx] = {
            ...results[resultIx],
            precip: yesterdayPrecip || {},
          };
        })
        .catch(() => {
          console.warn("[MANITOBA]", station.name, "failed to fetch data");
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    highLowAroundMB.splice(0, highLowAroundMB.length, ...results);
  });
}

module.exports = { fetchHighLowAroundMB, highLowAroundMB };
