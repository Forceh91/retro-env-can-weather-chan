const axios = require("axios");
const Weather = require("ec-weather-js");

const observedCities = [
  { name: "Portage", stationCode: "MB/s0000626", area: "mb/on" },
  { name: "Brandon", stationCode: "MB/s0000492", area: "mb/on" },
  { name: "Dauphin", stationCode: "MB/s0000508", area: "mb/on" },
  { name: "Kenora", stationCode: "ON/s0000651", area: "mb/on" },
  { name: "Thompson", stationCode: "MB/s0000695", area: "mb/on" },
  { name: "The Pas", stationCode: "MB/s0000644", area: "mb/on" },
  { name: "Lynn Lake", stationCode: "MB/s0000777", area: "mb/on" },
  { name: "Vancouver", stationCode: "BC/s0000141", area: "west" },
  { name: "Victoria", stationCode: "BC/s0000775", area: "west" },
  { name: "Edmonton", stationCode: "AB/s0000510", area: "west" },
  { name: "Calgary", stationCode: "AB/s0000047", area: "west" },
  { name: "Saskatoon", stationCode: "SK/s0000797", area: "west" },
  { name: "Regina", stationCode: "SK/s0000788", area: "west" },
  { name: "Thunder Bay", stationCode: "ON/s0000411", area: "west" },
  { name: "Toronto", stationCode: "ON/s0000458", area: "east" },
  { name: "Ottawa", stationCode: "ON/s0000623", area: "east" },
  { name: "Montreal", stationCode: "QC/s0000635", area: "east" },
  { name: "Quebec City", stationCode: "QC/s0000620", area: "east" },
  { name: "Fredericton", stationCode: "NB/s0000250", area: "east" },
  { name: "Halifax", stationCode: "NS/s0000318", area: "east" },
  { name: "St. John's", stationCode: "NL/s0000280", area: "east" },
  { name: "Churchill", stationCode: "MB/s0000779", isBackup: true, area: "mb/on" },
  { name: "Sx. Lookout", stationCode: "ON/s0000748", isBackup: true, area: "mb/on" },
  { name: "Red Lake", stationCode: "ON/s0000676", isBackup: true, area: "mb/on" },
  { name: "Flin Flon", stationCode: "MB/s0000015", isBackup: true, area: "mb/on" },
  { name: "Norway House", stationCode: "MB/s0000616", isBackup: true, area: "mb/on" },
  { name: "Dryden", stationCode: "ON/s0000546", isBackup: true, area: "mb/on" },
  { name: "Gillam", stationCode: "MB/s0000543", isBackup: true, area: "mb/on" },
  { name: "Whitehorse", stationCode: "YT/s0000825", isBackup: true, area: "west" },
  { name: "Yellowknife", stationCode: "NT/s0000366", isBackup: true, area: "west" },
  { name: "Medicine Hat", stationCode: "AB/s0000745", isBackup: true, area: "west" },
  { name: "Lethbridge", stationCode: "AB/s0000652", isBackup: true, area: "west" },
  { name: "Kelowna", stationCode: "BC/s0000592", isBackup: true, area: "west" },
  { name: "Kamloops", stationCode: "BC/s0000568", isBackup: true, area: "west" },
  { name: "Yorkton", stationCode: "SK/s0000663", isBackup: true, area: "west" },
  { name: "Charlottet'n", stationCode: "PE/s0000583", isBackup: true, area: "east" },
  { name: "London", stationCode: "ON/s0000326", isBackup: true, area: "east" },
  { name: "Moncton", stationCode: "NB/s0000654", isBackup: true, area: "east" },
  { name: "Sydney", stationCode: "NS/s0000670", isBackup: true, area: "east" },
  { name: "Windsor", stationCode: "NS/s0000438", isBackup: true, area: "east" },
  { name: "Sudbury", stationCode: "ON/s0000680", isBackup: true, area: "east" },
  { name: "Gander", stationCode: "NL/s0000667", isBackup: true, area: "east" },
];

const areas = ["mb/on", "west", "east"];

const latestObservations = [];
function fetchWeatherForObservedCities() {
  const results = [...observedCities.map((station) => ({ ...station, observation: { condition: null, temp: null } }))];

  const fillObservationForStation = (station, weather) => {
    const resultIx = results.findIndex((s) => s.name === station.name);
    if (resultIx !== -1)
      results[resultIx] = {
        ...results[resultIx],
        observation: {
          condition: weather.current?.condition || null,
          temp: weather.current?.temperature?.value || null,
        },
      };
  };

  const promises = [];
  observedCities.forEach((station) => {
    promises.push(
      axios
        .get(`https://dd.weather.gc.ca/citypage_weather/xml/${station.stationCode}_e.xml`)
        .then((resp) => {
          const data = resp && resp.data;
          const weather = new Weather(data);
          if (!weather) throw "Unable to parse weather data";

          fillObservationForStation(station, weather);
        })
        .catch(() => {
          console.warn("[OBSERVATION]", station.name, "failed to fetch data");
          fillObservationForStation(station, {});
        })
    );
  });

  Promise.allSettled(promises).then(() => {
    // we need to filter out main stations that aren't reporting and put a backup in place at the end of the list
    // find all the reporting stations (classed as reporting if condition or temp aren't null)
    const stationsToPush = [];
    areas.forEach((area) => {
      const mainStations = results.filter((city) => !city.isBackup && city.area === area);
      const reportingMainStations = mainStations.filter((city) => isStationReporting(city) && city.area === area);

      // find all reporting backup stations
      const reportingBackupStations = results.filter(
        (city) => city.isBackup && isStationReporting(city) && city.area === area
      );

      // get the number of non backup stations that aren't reporting
      const nonReportingStationCount =
        mainStations.filter(
          (city) => city.area === area && city.observation?.condition === null && city.observation?.temp === null
        )?.length || 0;

      // start off with this
      stationsToPush.push(...reportingMainStations);

      // if there are non reporting stations, take some of the reporting backup stations and put them at the end
      if (nonReportingStationCount > 0)
        stationsToPush.push(...reportingBackupStations.slice(0, nonReportingStationCount));
    });

    latestObservations.splice(0, latestObservations.length, ...stationsToPush);
  });
}

function isStationReporting(station) {
  if (!station) return false;
  return station.observation?.condition !== null && station.observation?.temp !== null;
}

module.exports = { fetchWeatherForObservedCities, latestObservations };
