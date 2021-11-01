const axios = require("axios");
const Weather = require("ec-weather-js");

const observedCities = [
  { name: "Brandon", stationCode: "MB/s0000492" },
  { name: "Dauphin", stationCode: "MB/s0000508" },
  { name: "Kenora", stationCode: "ON/s0000651" },
  { name: "Thompson", stationCode: "MB/s0000695" },
  { name: "The Pas", stationCode: "MB/s0000644" },
  { name: "Lynn Lake", stationCode: "MB/s0000777" },
  { name: "Churchill", stationCode: "MB/s0000779" },
  { name: "Vancouver", stationCode: "BC/s0000141" },
  { name: "Victoria", stationCode: "BC/s0000775" },
  { name: "Edmonton", stationCode: "AB/s0000510" },
  { name: "Calgary", stationCode: "AB/s0000047" },
  { name: "Saskatoon", stationCode: "SK/s0000797" },
  { name: "Regina", stationCode: "SK/s0000788" },
  { name: "Thunder Bay", stationCode: "ON/s0000411" },
  { name: "Toronto", stationCode: "ON/s0000458" },
  { name: "Ottawa", stationCode: "ON/s0000623" },
  { name: "Montreal", stationCode: "ON/s0000762" },
  { name: "Quebec City", stationCode: "QC/s0000620" },
  { name: "Fredericton", stationCode: "NB/s0000250" },
  { name: "Halifax", stationCode: "NS/s0000318" },
  { name: "St. John's", stationCode: "NL/s0000280" },
];

const latestObservations = [];
function fetchWeatherForObservedCities() {
  const results = [...observedCities.map((station) => ({ ...station, observation: { condition: null, temp: null } }))];

  const promises = [];
  observedCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://dd.weather.gc.ca/citypage_weather/xml/${station.stationCode}_e.xml`)
        .then((resp) => {
          const data = resp && resp.data;
          const weather = new Weather(data);
          if (!weather) throw "Unable to parse weather data";

          const resultIx = results.findIndex((s) => s.name === station.name);
          if (resultIx !== -1)
            results[resultIx] = {
              ...results[resultIx],
              observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
            };
        })
        .catch(() => {
          console.warn("[OBSERVATION]", station.name, "failed to fetch data");
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    latestObservations.splice(0, latestObservations.length, ...results);
  });
}

module.exports = { fetchWeatherForObservedCities, latestObservations };
