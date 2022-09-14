const fs = require("fs");

const { generatePlaylist, getPlaylist } = require("../generate-playlist.js");
const { generateCrawler, getCrawler } = require("../generate-crawler.js");

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
  };
};

const initWeatherChannel = (app, callback) => {
  // check file size
  checkConfigFileExists(callback);
};

const checkConfigFileExists = (callback) => {
  fs.stat(CONFIG_FILE, (err, stats) => {
    if (err || !(stats.size > 0)) {
      return console.error("[CONFIG] No config file found, loading defaults");
    }
  });

  loadConfigFile(CONFIG_FILE, callback);
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

    // load the crawler
    generateCrawler();

    // load the playlist
    generatePlaylist();

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
