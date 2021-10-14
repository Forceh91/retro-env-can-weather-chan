const Weather = require("ec-weather-js");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const { exit } = require("process");
const path = require("path");
const { generatePlaylist, getPlaylist } = require("./generate-playlist.js");
const { generateCrawler, getCrawler } = require("./generate-crawler.js");

const corsOptions = {
  origin: "http://localhost:8080",
  optionsSuccessStatus: 200,
};
const app = express().use(cors(corsOptions));
const port = 8600;

let configHasSize = false;
const CONFIG_FILE = "./cfg/retro-evc-config.json";
fs.stat(CONFIG_FILE, (err, stats) => {
  if (err) {
    console.error("No config file found, run setup first!");
    exit();
  } else configHasSize = stats.size > 0;

  // double check its not empty
  if (!configHasSize) {
    console.error("No config file found, run setup first!");
    exit();
  }

  // load it
  fs.readFile(CONFIG_FILE, "utf8", (err, data) => {
    if (err || !data || !data.length) {
      console.error("Config file has no data");
      exit();
    }

    const parsedJSON = JSON.parse(data);
    if (!parsedJSON) return;

    const primaryLocation = parsedJSON.primaryLocation;
    if (
      !primaryLocation.province ||
      !primaryLocation.province.length ||
      !primaryLocation.location ||
      !primaryLocation.location.length
    ) {
      console.error("Config file is corrupted");
      exit();
    }

    console.log(
      `Loading retro-envcan with primary location of ${primaryLocation.name || "N/A"} - ${primaryLocation.province}`
    );
    console.log(`Listening on ${port}...`);
    console.log(`Navigate to http://localhost:8600/ in your browser`);

    startBackend(parsedJSON);
  });
});

function startBackend(config) {
  // generate channel playlist from music folder
  generatePlaylist();

  // generate crawler messages
  generateCrawler();

  app.get("/api/init", (req, res) => {
    const playlist = getPlaylist();
    const crawler = getCrawler();
    res.send({
      playlist: { files: playlist, file_count: playlist.length },
      crawler: { messages: crawler, message_count: crawler.length },
    });
  });

  // handling api requests
  const majorObservations = [];
  fetchLatestObservationsForMajorCities();
  setInterval(fetchLatestObservationsForMajorCities, 5 * 60 * 1000);

  const primaryLocation = config?.primaryLocation || {};
  app.get("/api/weather", (req, res) => {
    axios
      .get(
        `https://dd.weather.gc.ca/citypage_weather/xml/${primaryLocation.province}/${primaryLocation.location}_e.xml`
      )
      .then((resp) => {
        const weather = new Weather(resp.data);
        if (!weather) return;
        res.send({
          location: weather.all.location,
          current: weather.current,
          riseSet: weather.all.riseSet,
          observed: weather.date,
          upcomingForecast: weather.weekly,
          warnings: weather.all.warnings,
          almanac: weather.all.almanac,
        });
      });
  });

  app.get("/api/weather/surrounding", (req, res) => {
    res.send({ observations: majorObservations });
  });

  function fetchLatestObservationsForMajorCities() {
    majorObservations.splice(0);

    // toronto
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000458_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Toronto",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // ottawa
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000623_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Ottawa",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // montreal
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000762_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Montreal",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // calgary
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/AB/s0000047_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Calgary",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // vancouver
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/BC/s0000141_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Vancouver",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // banff
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/AB/s0000404_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Banff",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // edmonton
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/AB/s0000510_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Edmonton",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // thunder bay
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000411_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Thunder Bay",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // saskatoon
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/SK/s0000797_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Saskatoon",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // winnipeg
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/MB/s0000193_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Winnipeg",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // quebec
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/QC/s0000620_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Quebec City",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // niagara falls
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/ON/s0000692_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Niagara Fls",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // halifax
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/NS/s0000318_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "Halifax",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });

    // St. John's
    axios.get("https://dd.weather.gc.ca/citypage_weather/xml/NL/s0000280_e.xml").then((resp) => {
      const weather = new Weather(resp.data);
      if (!weather) return;

      majorObservations.push({
        city: "St. John's",
        observation: { condition: weather.current?.condition, temp: weather.current?.temperature?.value },
      });
    });
  }
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
