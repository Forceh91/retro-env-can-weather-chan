const axios = require("axios");

const observedCities = [
  { name: "Grand Forks", stationCode: "KGFK" },
  { name: "Fargo", stationCode: "KFAR" },
  { name: "Minneapolis", stationCode: "KMSP" },
  { name: "Chicago", stationCode: "KORD" },
  { name: "Las Vegas", stationCode: "KVGT" },
  { name: "Tampa", stationCode: "KTPA" },
  { name: "Los Angeles", stationCode: "KCQT" },
  { name: "Denver", stationCode: "KBKF", isBackup: true },
  { name: "Detroit", stationCode: "KDET", isBackup: true },
  { name: "New York", stationCode: "KNYC", isBackup: true },
  { name: "Miami", stationCode: "KMIA", isBackup: true },
  { name: "Santa Fe", stationCode: "KSAF", isBackup: true },
  { name: "Dallas", stationCode: "KDFW", isBackup: true },
  { name: "Seattle", stationCode: "KSEA", isBackup: true },
];

const latestUSObservations = [];
function fetchWeatherForObservedUSCities() {
  const results = [...observedCities.map((station) => ({ ...station, observation: { condition: null, temp: null } }))];

  const fillObservationForCity = (station, data) => {
    const resultIx = results.findIndex((s) => s.name === station.name);
    if (resultIx !== -1)
      results[resultIx] = {
        ...results[resultIx],
        observation: {
          condition: data.properties?.textDescription || null,
          temp: data.properties?.temperature?.value || null,
        },
      };
  };

  const promises = [];
  observedCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://api.weather.gov/stations/${station.stationCode}/observations/latest`)
        .then((resp) => {
          const data = resp && resp.data;
          if (!data) return;

          fillObservationForCity(station, data);
        })
        .catch(() => {
          console.warn("[US OBSERVATION]", station.name, "failed to fetch data");
          fillObservationForCity(station, {});
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    // we need to filter out main stations that aren't reporting and put a backup in place at the end of the list
    // find all the reporting stations (classed as reporting if condition or temp aren't null)
    const mainStations = results.filter((city) => !city.isBackup);
    const reportingMainStations = mainStations.filter((city) => isStationReporting(city));

    // find all reporting backup stations
    const reportingBackupStations = results.filter((city) => city.isBackup && isStationReporting(city));

    // get the number of non backup stations that aren't reporting
    const nonReportingStationCount = mainStations.filter((city) => !isStationReporting(city))?.length || 0;

    // start off with this
    const stationsToPush = [...reportingMainStations];

    // if there are non reporting stations, take some of the reporting backup stations and put them at the end
    if (nonReportingStationCount > 0)
      stationsToPush.push(...reportingBackupStations.slice(0, nonReportingStationCount));

    // push this into what we send to the channel
    latestUSObservations.splice(0, latestUSObservations.length, ...stationsToPush);
  });
}

function isStationReporting(station) {
  if (!station) return false;
  return station.observation?.condition !== null && station.observation?.temp !== null;
}

module.exports = { fetchWeatherForObservedUSCities, latestUSObservations };
