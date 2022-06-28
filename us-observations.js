const axios = require("axios");

const observedCities = [
  { name: "Grand Forks", stationCode: "KGFK" },
  { name: "Fargo", stationCode: "KFAR" },
  { name: "Minneapolis", stationCode: "KMSP" },
  { name: "Chicago", stationCode: "KORD" },
  { name: "Las Vegas", stationCode: "KVGT" },
  { name: "Tampa", stationCode: "KTPA" },
  { name: "Los Angeles", stationCode: "KCQT" },
];

const latestUSObservations = [];
function fetchWeatherForObservedUSCities() {
  const results = [...observedCities.map((station) => ({ ...station, observation: { condition: null, temp: null } }))];

  const promises = [];
  observedCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://api.weather.gov/stations/${station.stationCode}/observations/latest`)
        .then((resp) => {
          const data = resp && resp.data;
          if (!data) return;

          const resultIx = results.findIndex((s) => s.name === station.name);
          if (resultIx !== -1)
            results[resultIx] = {
              ...results[resultIx],
              observation: { condition: data.properties?.textDescription, temp: data.properties?.temperature?.value },
            };
        })
        .catch(() => {
          console.warn("[US OBSERVATION]", station.name, "failed to fetch data");
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    latestUSObservations.splice(0, latestUSObservations.length, ...results);
    console.log(latestUSObservations);
  });
}

module.exports = { fetchWeatherForObservedUSCities, latestUSObservations };
