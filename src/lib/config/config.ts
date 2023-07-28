import { DEFAULT_WEATHER_STATION_ID, FS_NO_FILE_FOUND } from "consts";
import fs from "fs";
import { FlavourLoader } from "lib/flavour";
import Logger from "lib/logger";
import { ClimateNormals, Flavour, LookAndFeel, MiscConfig, PrimaryLocation } from "types";

const logger = new Logger("config");
const CONFIG_PATH = {
  FOLDER: "./cfg",
  FILE: "rwc-config.json",
};
const CONFIG_ABSOLUTE_PATH = `${CONFIG_PATH.FOLDER}/${CONFIG_PATH.FILE}`;
const BAD_CONFIG_FILE_ERROR_MESSAGE = "Unable to load config file, defaults have been loaded";

const CRAWLER_PATH = {
  FOLDER: "./cfg",
  FILE: "crawler.txt",
};
const CRAWLER_ABSOLUTE_PATH = `${CRAWLER_PATH.FOLDER}/${CRAWLER_PATH.FILE}`;

class Config {
  primaryLocation: PrimaryLocation = {
    province: "MB",
    location: DEFAULT_WEATHER_STATION_ID,
    name: "Winnipeg",
  };
  provinceHighLowEnabled = true; // eventually you can choose what cities this tracks but for now this is true/false
  historicalDataStationID = 27174; // (used for last year temps + precip data) winnipeg a cs
  climateNormals: ClimateNormals = {
    stationID: 3698, // winnipeg richardson a (used for climate normals on last month summary)
    climateID: 5023222, // (used for climate normals on last month summary)
    province: "MB",
  };
  lookAndFeel: LookAndFeel = { font: "vt323", flavour: "test" };
  misc: MiscConfig = {
    rejectInHourConditionUpdates: false, // whether we should only update conditions once an hour
    alternateRecordsSource: undefined, // if you want to supply your own record data to override what ECCC has, you can do it here with a JSON file at http(s)://example.com/records.json
  };
  crawlerMessages: string[];
  flavour: Flavour;

  constructor() {
    this.loadConfig();
    this.loadFlavour();
    this.loadCrawlerMessages();
  }

  get config() {
    return {
      primaryLocation: this.primaryLocation,
      provinceHighLowEnabled: this.provinceHighLowEnabled,
      historicalDataStationID: this.historicalDataStationID,
      climateNormals: this.climateNormals,
      lookAndFeel: this.lookAndFeel,
      misc: this.misc,
      flavour: this.flavour,
    };
  }

  private loadConfig() {
    logger.log("Loading config file", `(${CONFIG_ABSOLUTE_PATH})`, "...");

    // attempt to the read the file
    try {
      const data = fs.readFileSync(CONFIG_ABSOLUTE_PATH, "utf8");

      // parse the json from the config file
      const parsedConfig = JSON.parse(data);
      if (!parsedConfig) throw "Bad config data";

      // now assign our values from what we had in the config file
      const {
        primaryLocation,
        primaryLocation: { name, province, location },
        provinceHighLowEnabled,
        historicalDataStationID,
        climateNormals,
        lookAndFeel,
        misc,
      } = parsedConfig;

      // but first we make sure that we have at least the province info
      if (!location?.length || !province?.length) throw "Bad primary location data";

      // now we just copy our config file over to our class (with fallbacks to the original)
      this.primaryLocation = primaryLocation ?? this.primaryLocation;
      this.provinceHighLowEnabled = provinceHighLowEnabled ?? this.provinceHighLowEnabled;
      this.historicalDataStationID = historicalDataStationID ?? this.historicalDataStationID;
      this.climateNormals = climateNormals ?? this.climateNormals;
      this.lookAndFeel = { ...this.lookAndFeel, ...lookAndFeel };
      this.misc = misc ?? this.misc;

      logger.log("Loaded weather channel. Location:", `${name}, ${province}`, `(${location})`);
    } catch (err) {
      if (err.code === FS_NO_FILE_FOUND) {
        // handle no file found
        logger.error("No config fle found, loading defaults");
        logger.error("Configuration can be set via http://localhost:8600/#/config");
      } else {
        // handle any other error
        logger.error(BAD_CONFIG_FILE_ERROR_MESSAGE);
      }
    }
  }

  private loadFlavour() {
    logger.log("Loading flavour (screen rotation)", this.lookAndFeel.flavour);

    this.flavour = new FlavourLoader(this.lookAndFeel.flavour);
    if (!this.flavour) logger.error("Unable to load flavour, please check your config");
  }

  private loadCrawlerMessages() {
    logger.log("Loading crawler messages from", CRAWLER_ABSOLUTE_PATH);
    try {
      const data = fs.readFileSync(CRAWLER_ABSOLUTE_PATH, "utf8");
      this.crawlerMessages = data
        .split("\n")
        .map((message) => message.trim())
        .filter((message) => message.length);

      logger.log("Loaded", this.crawlerMessages.length, "crawler messages");
    } catch (err) {
      if (err.code === "ENOENT") {
        // handle no file found
        logger.error("No crawler file found");
      } else {
        // handle any other error
        logger.error("Unable to load from crawler file");
      }
    }
  }

  private saveConfig() {
    logger.log("Saving config file", `(${CONFIG_ABSOLUTE_PATH})`, "...");

    try {
      fs.writeFileSync(CONFIG_ABSOLUTE_PATH, JSON.stringify(this.config), "utf8");
      logger.log("Config file saved successfully");
    } catch (err) {
      logger.error("Failed to save config file");
    }
  }
}

let config: Config = null;
export function initializeConfig(): Config {
  if (config) return config;

  config = new Config();
  return config;
}
