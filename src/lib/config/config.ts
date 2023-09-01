import {
  AIR_QUALITY_DEFAULT_STATION,
  DEFAULT_WEATHER_STATION_ID,
  FLAVOUR_DIRECTORY,
  FS_NO_FILE_FOUND,
  PROVINCE_TRACKING_DEFAULT_STATIONS,
} from "consts";
import fs from "fs";
import { FlavourLoader } from "lib/flavour";
import Logger from "lib/logger";
import {
  ClimateNormals,
  ECCCWeatherStation,
  Flavour,
  LookAndFeel,
  MiscConfig,
  PrimaryLocation,
  ProvinceStation,
  ProvinceStations,
} from "types";

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
const MUSIC_DIR = "music";

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
  lookAndFeel: LookAndFeel = { font: "vt323", flavour: "default" };
  misc: MiscConfig = {
    rejectInHourConditionUpdates: false, // whether we should only update conditions once an hour
    alternateRecordsSource: undefined, // if you want to supply your own record data to override what ECCC has, you can do it here with a JSON file at http(s)://example.com/records.json
  };
  crawlerMessages: string[] = [];
  musicPlaylist: string[] = []; // what music files are available
  flavour: Flavour;
  flavours: string[] = []; // what flavours are available
  provinceStations: ProvinceStation[]; // what provinces to track high/low/precip for
  airQualityStation: string; // what area/station code to use for air quality

  constructor() {
    this.loadConfig();
    this.checkFlavoursDirectory();
    this.loadFlavour();
    this.loadCrawlerMessages();
    this.checkMusicDirectory();
  }

  get config() {
    return {
      primaryLocation: this.primaryLocation,
      provinceHighLowEnabled: this.provinceHighLowEnabled,
      provinceStations: this.provinceStations,
      historicalDataStationID: this.historicalDataStationID,
      climateNormals: this.climateNormals,
      lookAndFeel: this.lookAndFeel,
      misc: this.misc,
      flavour: this.flavour,
      flavours: this.flavours,
      airQualityStation: this.airQualityStation,
      crawler: this.crawlerMessages,
    };
  }

  get configWithoutFlavour() {
    const config = { ...this.config };
    delete config.flavour;
    delete config.flavours;
    delete config.crawler;
    return config;
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
        provinceStations,
        airQualityStation,
      } = parsedConfig;

      // but first we make sure that we have at least the province info
      if (!location?.length || !province?.length) throw "Bad primary location data";

      // now we just copy our config file over to our class (with fallbacks to the original)
      this.primaryLocation = primaryLocation ?? this.primaryLocation;
      this.provinceHighLowEnabled = provinceHighLowEnabled ?? this.provinceHighLowEnabled;
      this.historicalDataStationID = historicalDataStationID ?? this.historicalDataStationID;
      this.climateNormals = { ...this.climateNormals, ...climateNormals };
      this.lookAndFeel = { ...this.lookAndFeel, ...lookAndFeel };
      this.misc = { ...this.misc, ...misc };
      this.provinceStations =
        provinceHighLowEnabled && provinceStations?.length ? provinceStations : PROVINCE_TRACKING_DEFAULT_STATIONS;
      this.airQualityStation = airQualityStation ?? AIR_QUALITY_DEFAULT_STATION;

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

  private saveCrawlerMessages() {
    logger.log("Saving crawler messages to", CRAWLER_ABSOLUTE_PATH);
    try {
      fs.writeFileSync(CRAWLER_ABSOLUTE_PATH, this.crawlerMessages.join("\n"), "utf8");
      logger.log("Saved", this.crawlerMessages.length, "crawler messages");
    } catch (err) {
      if (err.code === "ENOENT") {
        // handle no file found
        logger.error("No crawler file found");
      } else {
        // handle any other error
        logger.error("Unable to save to crawler file");
      }
    }
  }

  private checkMusicDirectory() {
    logger.log("Loading playlist from", MUSIC_DIR);

    fs.readdir(MUSIC_DIR, (err, files) => {
      if (err) logger.error("Failed to generate playlist");
      else {
        this.musicPlaylist.splice(
          0,
          this.musicPlaylist.length,
          ...files.filter((f) => f.endsWith(".mp3")).map((f) => `${MUSIC_DIR}/${f}`)
        );
        logger.log("Generated playlist of", this.musicPlaylist.length, "files");
      }
    });
  }

  private checkFlavoursDirectory() {
    logger.log("Checking available flavours from", FLAVOUR_DIRECTORY);

    fs.readdir(FLAVOUR_DIRECTORY, (err, files) => {
      if (err) logger.error("Failed to retrieve available flavours");
      else {
        this.flavours.splice(
          0,
          this.flavours.length,
          ...files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""))
        );
        logger.log("Found", this.flavours.length, "available flavours");
      }
    });
  }

  private saveConfig() {
    logger.log("Saving config file", `(${CONFIG_ABSOLUTE_PATH})`, "...");

    try {
      fs.writeFileSync(CONFIG_ABSOLUTE_PATH, JSON.stringify(this.configWithoutFlavour), "utf8");
      logger.log("Config file saved successfully");
    } catch (err) {
      logger.error("Failed to save config file");
    }
  }

  public updateAndSaveConfigOption(updateFunc: () => void) {
    updateFunc();
    this.saveConfig();
  }

  public setPrimaryLocation(station: ECCCWeatherStation) {
    if (!station) return;

    this.primaryLocation = station;
  }

  public setProvinceStations(isEnabled: boolean, stations: ProvinceStations) {
    this.provinceHighLowEnabled = isEnabled;
    if (stations?.length) this.provinceStations = stations;
  }

  public setHistoricalDataStationID(id: number) {
    if (!id || isNaN(id)) return;

    this.historicalDataStationID = id;
  }

  public setClimateNormals(climateID: number, stationID: number, province: string) {
    if (!climateID || isNaN(climateID)) return;
    if (!stationID || isNaN(stationID)) return;
    if (!province.length || province.length > 2 || typeof province !== "string") return;

    this.climateNormals = {
      ...this.climateNormals,
      climateID,
      stationID,
      province: province.toUpperCase(),
    };
  }

  public regenerateAvailableFlavours() {
    this.checkFlavoursDirectory();
  }

  public setMiscSettings(rejectInHourConditionUpdates: boolean, alternateRecordsSource: string) {
    this.misc.alternateRecordsSource = alternateRecordsSource;
    this.misc.rejectInHourConditionUpdates = rejectInHourConditionUpdates;
  }

  public setLookAndFeelSettings(flavour: string) {
    if (!flavour) this.lookAndFeel.flavour = "default";
    else this.lookAndFeel.flavour = flavour;

    this.loadFlavour();
  }

  public setAirQualityStation(station: string) {
    this.airQualityStation = station;
  }

  public setCrawlerMessages(crawler: string[]) {
    this.crawlerMessages.splice(
      0,
      this.crawlerMessages.length,
      ...crawler.map((message) => message.trim()).filter((message) => message.length)
    );
    this.saveCrawlerMessages();
  }
}

let config: Config = null;
export function initializeConfig(): Config {
  if (process.env.NODE_ENV === "test") return new Config();
  if (config) return config;

  config = new Config();
  return config;
}
