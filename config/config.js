const fs = require("fs");

const { generatePlaylist, getPlaylist, reloadPlaylist } = require("../generate-playlist.js");
const { generateCrawler, getCrawler, saveCrawler } = require("../generate-crawler.js");

const CONFIG_FOLDER = "./cfg";
const CONFIG_FILE_NAME = "retro-evc-config.json";
const CONFIG_FILE = `${CONFIG_FOLDER}/${CONFIG_FILE_NAME}`;

const defaultConfig = () => {
  return {
    primaryLocation: {
      province: "MB",
      location: "s0000193",
      name: "Winnipeg",
    },
    proviceHighLowEnabled: true,
    historicalDataStationID: 27174, // (used for last year temps + precip data) winnipeg a cs
    climateNormalsStationID: 3698, // winnipeg richardson a (used for climate normals on last month summary)
    climateNormalsClimateID: 5023222, // (used for climate normals on last month summary)
  };
};

const initWeatherChannel = (app, callback) => {
  setupRoutes(app);

  // check file size
  checkConfigFileExists(callback);
};

const checkConfigFileExists = (callback) => {
  let hasConfigFile = false;
  fs.stat(CONFIG_FILE, (err, stats) => {
    if (err) {
      // error whilst loading this file so do defaults and callback
      console.error("[CONFIG] No config file found, loading defaults");
      if (typeof callback === "function") callback();
    } else {
      // no error loading, check the size and either callback or load the file
      hasConfigFile = stats.size > 0;
      if (hasConfigFile) loadConfigFile(CONFIG_FILE, callback);
      else {
        loadConfigDefaults();
        if (typeof callback === "function") callback();
      }
    }
  });

  // load the crawler
  generateCrawler();

  // load the playlist
  generatePlaylist();
};

const loadConfigFile = (configFilePath, callback) => {
  if (!configFilePath || !configFilePath.length) return;

  fs.readFile(configFilePath, "utf8", (err, data) => {
    if (err || !data || !data.length) {
      return loadConfigDefaults();
    }

    const parsedJSON = JSON.parse(data);
    if (!parsedJSON) return loadConfigDefaults();

    const { primaryLocation, proviceHighLowEnabled } = parsedJSON;
    const { province, location } = primaryLocation || {};
    if (!primaryLocation || !province || !province.length || !location || !location.length) return loadConfigDefaults();

    // store the primary location
    config.primaryLocation = primaryLocation;

    // store whether the province high/low should load
    config.proviceHighLowEnabled = proviceHighLowEnabled;

    // say the config was loaded
    console.log(
      "[CONFIG]",
      `Loaded weather channel for ${config.primaryLocation.name}, ${config.primaryLocation.province}`
    );

    // callback to whatever wanted this
    if (typeof callback === "function") callback();
  });
};

const saveConfigFile = () => {
  console.log("[CONFIG] Saving config file to", CONFIG_FILE, "...");
  const configAsJSONString = JSON.stringify(config);

  fs.writeFile(CONFIG_FILE, configAsJSONString, "utf8", (err, data) => {
    if (!err) console.log("[CONFIG] Config file saved!");
  });
};

const loadConfigDefaults = () => {
  console.error("[CONFIG] Config file is invalid, loading defaults");
};

const setupRoutes = (app) => {
  if (!app) return;

  app.get("/config/all", (req, res) => {
    res.send({ config, playlist: playlist(), crawler: crawler() });
  });

  app.post("/config/crawler", (req, res) => {
    const { crawler_messages } = req.body;
    if (!crawler_messages) return res.sendStatus(400);
    else {
      saveCrawler(crawler_messages, (result) => {
        if (!result) res.sendStatus(500);
        else res.sendStatus(200);
      });
    }
  });

  app.post("/config/playlist", (req, res) => {
    reloadPlaylist((result) => {
      if (!result) res.sendStatus(500);
      else {
        res.send({ playlist: result });
      }
    });
  });
};

const isProvinceHighLowEnabled = () => {
  return config.proviceHighLowEnabled || false;
};

const primaryLocation = () => {
  return config.primaryLocation || {};
};

const playlist = () => {
  return getPlaylist() || [];
};

const crawler = () => {
  return getCrawler() || [];
};

const config = defaultConfig();

module.exports = { initWeatherChannel, isProvinceHighLowEnabled, primaryLocation, playlist, crawler };
