const fs = require("fs");
const axios = require("axios");
const { xml2js } = require("xml-js");

const { generatePlaylist, getPlaylist, reloadPlaylist } = require("../generate-playlist.js");
const { generateCrawler, getCrawler, saveCrawler } = require("../generate-crawler.js");
const { reloadCurrentConditions } = require("../current-conditions");

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
    provinceHighLowEnabled: true, // eventually you can choose what cities this tracks but for now this is true/false
    historicalDataStationID: 27174, // (used for last year temps + precip data) winnipeg a cs
    climateNormalsStationID: 3698, // winnipeg richardson a (used for climate normals on last month summary)
    climateNormalsClimateID: 5023222, // (used for climate normals on last month summary)
    climateNormalsProvince: "MB",
    lookAndFeel: { font: "vt323" },
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
      console.error("[CONFIG] Configuration can be set via http://localhost:8600/#/config");
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

    const {
      primaryLocation,
      provinceHighLowEnabled,
      historicalDataStationID,
      climateNormalsClimateID,
      climateNormalsStationID,
      climateNormalsProvince,
      lookAndFeel,
    } = parsedJSON;
    const { province, location } = primaryLocation || {};
    if (!primaryLocation || !province || !province.length || !location || !location.length) return loadConfigDefaults();

    // store the primary location
    config.primaryLocation = primaryLocation;

    // store whether the province high/low should load
    config.provinceHighLowEnabled = provinceHighLowEnabled || config.provinceHighLowEnabled;

    // load the historical weather station id
    config.historicalDataStationID = historicalDataStationID || config.historicalDataStationID;

    // load the climate normals ids
    config.climateNormalsClimateID = climateNormalsClimateID || config.climateNormalsStationID;
    config.climateNormalsStationID = climateNormalsStationID || config.climateNormalsStationID;
    config.climateNormalsProvince = climateNormalsProvince || config.climateNormalsProvince;

    // get the look and feel info
    config.lookAndFeel = lookAndFeel || {};

    // say the config was loaded
    console.log(
      "[CONFIG]",
      `Loaded weather channel for ${config.primaryLocation.name}, ${config.primaryLocation.province}`
    );

    // callback to whatever wanted this
    if (typeof callback === "function") callback();
  });
};

const saveConfigFile = (callback) => {
  function doCallback(v) {
    if (typeof callback === "function") callback(v);
  }

  console.log("[CONFIG] Saving config file to", CONFIG_FILE, "...");
  const configAsJSONString = JSON.stringify(config);

  fs.writeFile(CONFIG_FILE, configAsJSONString, "utf8", (err, data) => {
    if (!err) {
      doCallback(true);
      console.log("[CONFIG] Config file saved!");
    } else {
      doCallback(false);
    }
  });
};

const loadConfigDefaults = () => {
  console.error("[CONFIG] Config file is invalid, loading defaults");
  console.error("[CONFIG] Configuration can be set via http://localhost:8600/#/config");
};

const storePrimaryLocation = (stationObj, callback) => {
  const { name, province, code } = stationObj;
  if (!name || !name.length || !province || !province.length || !code || !code.length) return;

  config.primaryLocation = {
    name,
    province,
    location: code,
  };

  saveConfigFile((result) => {
    if (!result) typeof callback === "function" && callback(result);
    else {
      reloadCurrentConditions(config.primaryLocation);
      typeof callback === "function" && callback(stationObj);
    }
  });
};

const storeHistoricalDataStationID = (stationID, callback) => {
  if (!stationID) return;

  config.historicalDataStationID = stationID;
  saveConfigFile((result) => {
    typeof callback === "function" && callback(result);
  });
};

const storeClimateStationIDs = (climateID, stationID, province, callback) => {
  if (!climateID || !stationID) return;

  config.climateNormalsClimateID = climateID;
  config.climateNormalsStationID = stationID;
  config.climateNormalsProvince = province;

  saveConfigFile((result) => {
    typeof callback === "function" && callback(result);
  });
};

const storeProvinceHighLowPrecipTracking = (enabled, callback) => {
  config.provinceHighLowEnabled = enabled;

  saveConfigFile((result) => {
    typeof callback === "function" && callback(result);
  });
};

const storeLookAndFeelFont = (font, callback) => {
  config.lookAndFeel.font = font;

  saveConfigFile((result) => {
    typeof callback === "function" && callback(result);
  });
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

  app.post("/config/weather-station", (req, res) => {
    const { station } = req.body;
    if (!station) return res.sendStatus(400);

    storePrimaryLocation(station, (result) => {
      if (!result) res.sendStatus(500);
      else {
        res.send({ station: config.primaryLocation });
      }
    });
  });

  app.post("/config/historical-data-station", (req, res) => {
    const { stationID } = req.body;
    if (!stationID) return res.sendStatus(400);

    storeHistoricalDataStationID(stationID, (result) => {
      if (!result) res.sendStatus(500);
      else {
        res.send({ historicalDataStationID: config.historicalDataStationID });
      }
    });
  });

  app.post("/config/climate-normals-station", (req, res) => {
    const { climateID, stationID, province } = req.body;
    if (!climateID || !stationID || !province) return res.sendStatus(400);

    storeClimateStationIDs(climateID, stationID, province, (result) => {
      if (!result) res.sendStatus(500);
      else {
        res.send({
          climateNormalsClimateID: config.climateNormalsClimateID,
          climateNormalsStationID: config.climateNormalsStationID,
          climateNormalsProvince: config.climateNormalsProvince,
        });
      }
    });
  });

  app.post("/config/province-high-low-precip-tracking", (req, res) => {
    const { provinceHighLowTracking } = req.body || {};
    storeProvinceHighLowPrecipTracking(provinceHighLowTracking, (result) => {
      if (!result) res.sendStatus(500);
      else
        res.send({
          provinceHighLowEnabled: config.provinceHighLowEnabled,
        });
    });
  });

  app.get("/config/eccc-weather-stations", (req, res) => {
    fetchAvailableWeatherStations((result) => {
      if (!result) res.sendStatus(500);
      else res.send(result);
    });
  });

  app.post("/config/look-and-feel/font", (req, res) => {
    const { font } = req.body || {};
    if (!font) return;

    storeLookAndFeelFont(font, (result) => {
      if (!result) res.sendStatus(500);
      else
        res.send({
          lookAndFeel: config.lookAndFeel,
        });
    });
  });
};

const fetchAvailableWeatherStations = (callback) => {
  axios.get("https://dd.weather.gc.ca/citypage_weather/xml/siteList.xml").then((resp) => {
    const data = resp.data;
    if (!data) return;

    const options = xml2js(data, { compact: true });
    if (!options || !options.siteList || !options.siteList.site) {
      if (typeof callback === "function") callback(false);
      throw "Unable to parse siteList";
    }

    const sortedByLocationProvince = options.siteList.site
      .sort((a, b) => {
        const provinceLocationA = `${a?.provinceCode._text} - ${a?.nameEn._text}`.toUpperCase();
        const provinceLocationB = `${b?.provinceCode._text} - ${b?.nameEn._text}`.toUpperCase();

        if (provinceLocationA < provinceLocationB) return -1;
        if (provinceLocationA > provinceLocationB) return 1;

        return 0;
      })
      .map((station) => ({
        name: station.nameEn._text,
        province: station.provinceCode._text,
        code: station._attributes.code,
      }));

    if (typeof callback === "function") callback(sortedByLocationProvince);
  });
};

const isProvinceHighLowEnabled = () => {
  return config.provinceHighLowEnabled || false;
};

const primaryLocation = () => {
  return config.primaryLocation || {};
};

const historicalDataStationID = () => {
  return config.historicalDataStationID || null;
};

const climateNormalsClimateID = () => {
  return config.climateNormalsClimateID || null;
};

const climateNormalsStationID = () => {
  return config.climateNormalsStationID || null;
};

const climateNormalsProvince = () => {
  return config.climateNormalsProvince || null;
};

const playlist = () => {
  return getPlaylist() || [];
};

const crawler = () => {
  return getCrawler() || [];
};

const lookAndFeel = () => {
  return config.lookAndFeel || {};
};

const config = defaultConfig();

module.exports = {
  initWeatherChannel,
  isProvinceHighLowEnabled,
  primaryLocation,
  historicalDataStationID,
  climateNormalsClimateID,
  climateNormalsStationID,
  climateNormalsProvince,
  playlist,
  crawler,
  lookAndFeel,
};
