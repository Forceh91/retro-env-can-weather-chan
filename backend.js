const express = require("express");
const cors = require("cors");
const path = require("path");
const { initCurrentConditions } = require("./current-conditions");
const { fetchWeatherForObservedCities, latestObservations } = require("./observations.js");
const { fetchWeatherForObservedUSCities, latestUSObservations } = require("./us-observations.js");
const { initManitobaTracking, manitobaHighLow } = require("./manitoba.js");
const historicalDataAPI = ({
  initHistoricalData,
  lastYearObservation,
  getSeasonPrecipData,
  getSeasonPrecipNormalsData,
  getLastMonthSummary,
} = require("./historical-data.js"));
const { fetchProvinceObservationData } = require("./province-today-observation.js");
const { startAlertMonitoring } = require("./alert-monitoring");
const { initAQHIObservation } = require("./aqhi-observation");
const { isWinterSeason } = require("./date-utils.js");
const config = require("./config/config");
const { getActivateInfoScreens } = require("./config/info-screens");

const corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200,
};
const app = express()
  .use(cors(corsOptions))
  .use(express.json());
const port = 8600;

// load in the config for the weather channel
config.initWeatherChannel(app, startBackend);

function startBackend() {
  console.log("[RECW]", `Application started, listening on http://localhost:${port}`);

  app.get("/api/init", (req, res) => {
    const playlist = config.playlist();
    const crawler = config.crawler();
    res.send({
      playlist: { files: playlist, file_count: playlist.length },
      crawler: { messages: crawler, message_count: crawler.length },
      showMBHighLow: config.isProvinceHighLowEnabled(),
      infoScreens: getActivateInfoScreens(),
    });
  });

  // current conditions info
  initCurrentConditions(config.primaryLocation(), app, historicalDataAPI);

  // handling api requests
  fetchWeatherForObservedCities();
  setInterval(fetchWeatherForObservedCities, 5 * 60 * 1000);

  // us city observations
  fetchWeatherForObservedUSCities();
  setInterval(fetchWeatherForObservedUSCities, 7.5 * 60 * 1000);

  // air quality readings
  initAQHIObservation(config.primaryLocation()?.name);

  // MB regional high/low screen
  // winnipeg, portage, brandon, dauphin, kenora, thompson
  if (config.isProvinceHighLowEnabled()) initManitobaTracking();

  // provincial today observations
  fetchProvinceObservationData(config.primaryLocation()?.province);
  setInterval(() => fetchProvinceObservationData(config.primaryLocation()?.province), 5 * 60 * 1000);

  app.get("/api/climate/season/precip", (req, res) => {
    res.send({
      isWinter: isWinterSeason(),
      totalPrecip: getSeasonPrecipData(),
      normalPrecip: getSeasonPrecipNormalsData(),
    });
  });

  app.get("/api/climate/lastmonth", (req, res) => {
    res.send({
      summary: getLastMonthSummary() || false,
    });
  });

  app.get("/api/weather/surrounding", (req, res) => {
    res.send({ observations: latestObservations });
  });

  app.get("/api/weather/usa", (req, res) => {
    res.send({ observations: latestUSObservations });
  });

  app.get("/api/weather/mb_highlow", (req, res) => {
    if (!config.isProvinceHighLowEnabled()) return;
    res.send(manitobaHighLow());
  });

  // start the amqp alert monitoring of cap
  startAlertMonitoring(config.primaryLocation()?.name, app);
}

app.listen(port);
app.use(express.static("dist"));
app.use(express.static("music"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

app.get("/music/*", (req, res) => {
  res.sendFile(path.join(__dirname, decodeURI(req.url)));
});
