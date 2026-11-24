import fs from "fs";
import uuid4 from "uuid4";
import {
  AIR_QUALITY_DEFAULT_STATION,
  DEFAULT_WEATHER_STATION_ID,
  EVENT_BUS_CONFIG_CHANGE_AIR_QUALITY_STATION,
  EVENT_BUS_CONFIG_CHANGE_CLIMATE_NORMALS,
  EVENT_BUS_CONFIG_CHANGE_HISTORICAL_TEMP_PRECIP,
  EVENT_BUS_CONFIG_CHANGE_PRIMARY_LOCATION,
  EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING,
  FLAVOUR_DIRECTORY,
  FS_NO_FILE_FOUND,
  PROVINCE_TRACKING_DEFAULT_STATIONS,
} from "consts";
import { FlavourLoader } from "lib/flavour";
import { getActiveInfoScreens, parseInfoScreens } from "lib/infoscreen";
import Logger from "lib/logger";
import {
  ClimateNormals,
  ECCCWeatherStation,
  Flavour,
  InfoScreenEntry,
  LookAndFeel,
  MiscConfig,
  RefreshMode,
  PrimaryLocation,
  ProvinceStation,
  ProvinceStations,
} from "types";
import eventbus from "lib/eventbus";

const logger = new Logger("config");

function normalizeProvinceStationCode(code: string): string {
  return code.replace(/\s/g, "").toUpperCase();
}

/** Apply known `climateStationId` defaults when JSON config omits them (same `code` as shipped Manitoba list). */
function mergeProvinceStationClimateDefaults(stations: ProvinceStation[]): ProvinceStation[] {
  const defaultsByCode = new Map(
    PROVINCE_TRACKING_DEFAULT_STATIONS.map((s) => [normalizeProvinceStationCode(s.code), s.climateStationId])
  );
  return stations.map((row) => {
    if (typeof row.climateStationId === "number" && Number.isFinite(row.climateStationId)) {
      return row;
    }
    const id = defaultsByCode.get(normalizeProvinceStationCode(row.code));
    if (typeof id === "number" && Number.isFinite(id)) {
      return { ...row, climateStationId: id };
    }
    return row;
  });
}
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
const INFO_SCREENS_PATH = {
  FOLDER: "./cfg",
  FILE: "info-screens.json",
};
const INFO_SCREENS_ABSOLUTE_PATH = `${INFO_SCREENS_PATH.FOLDER}/${INFO_SCREENS_PATH.FILE}`;
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
    refreshMode: "observation", // when the channel refreshes: "observation" | "observation-changes" | "ten-minute" | "ten-minute-alerts"
    alternateRecordsSource: undefined, // if you want to supply your own record data to override what ECCC has, you can do it here with a JSON file at http(s)://example.com/records.json
  };
  crawlerMessages: string[] = [];
  infoScreens: InfoScreenEntry[] = []; // custom text only screens, shown by the info screen
  musicPlaylist: string[] = []; // what music files are available
  flavour: Flavour;
  flavours: string[] = []; // what flavours are available
  provinceStations: ProvinceStation[]; // what provinces to track high/low/precip for
  airQualityStation: string; // what area/station code to use for air quality
  configVersion: string; // config version

  constructor() {
    this.loadConfig();
    this.checkFlavoursDirectory();
    this.loadFlavour();
    this.loadCrawlerMessages();
    this.loadInfoScreens();
    this.checkMusicDirectory();
    this.generateConfigVersion();
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
      infoScreens: this.infoScreens,
      music: this.musicPlaylist ?? [],
    };
  }

  get configWithoutFlavour() {
    const config = { ...this.config };
    delete config.flavour;
    delete config.flavours;
    delete config.crawler;
    delete config.infoScreens;
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
      const rawProvinceStations =
        provinceHighLowEnabled && provinceStations?.length ? provinceStations : PROVINCE_TRACKING_DEFAULT_STATIONS;
      this.provinceStations = mergeProvinceStationClimateDefaults(rawProvinceStations);
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

  private loadInfoScreens() {
    logger.log("Loading info screens from", INFO_SCREENS_ABSOLUTE_PATH);
    try {
      const { infoScreens } = JSON.parse(fs.readFileSync(INFO_SCREENS_ABSOLUTE_PATH, "utf8"));

      // anything that doesn't fit on the display is left out (and says why) rather than throwing the whole file away
      const { entries, errors } = parseInfoScreens(infoScreens);
      errors.forEach((error) => logger.error("Skipped an info screen:", error));

      this.infoScreens = entries;
      logger.log("Loaded", this.infoScreens.length, "info screens");
    } catch (err) {
      if (err.code === FS_NO_FILE_FOUND) {
        // handle no file found
        logger.log("No info screens file found");
      } else {
        // handle any other error
        logger.error("Unable to load from info screens file");
      }
    }
  }

  private saveInfoScreens() {
    logger.log("Saving info screens to", INFO_SCREENS_ABSOLUTE_PATH);
    try {
      // pretty printed since this file is meant to be easy to edit by hand too
      fs.writeFileSync(INFO_SCREENS_ABSOLUTE_PATH, JSON.stringify({ infoScreens: this.infoScreens }, null, 2), "utf8");
      logger.log("Saved", this.infoScreens.length, "info screens");
    } catch (err) {
      logger.error("Unable to save to info screens file");
      throw err;
    }
  }

  private checkMusicDirectory() {
    logger.log("Loading playlist from", MUSIC_DIR);

    fs.readdir(MUSIC_DIR, (err, files) => this.handleMusicDirectoryResponse(err, files));
  }

  private async checkMusicDirectoryBlocking() {
    logger.log("Loading playlist from", MUSIC_DIR);

    try {
      const files = await fs.readdirSync(MUSIC_DIR);
      this.handleMusicDirectoryResponse(undefined, files);
    } catch (e) {
      logger.error("Failed to generate playlist");
    }
  }

  private handleMusicDirectoryResponse(err: NodeJS.ErrnoException, files: string[]) {
    if (err) logger.error("Failed to generate playlist");
    else {
      this.musicPlaylist.splice(
        0,
        this.musicPlaylist.length,
        ...files.filter((f) => f.endsWith(".mp3")).map((f) => `${MUSIC_DIR}/${f}`)
      );
      logger.log("Generated playlist of", this.musicPlaylist.length, "files");
    }
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

  private generateConfigVersion() {
    this.configVersion = uuid4();
  }

  public updateAndSaveConfigOption(updateFunc: () => void) {
    updateFunc();
    this.generateConfigVersion();
    this.saveConfig();
  }

  public setPrimaryLocation(station: ECCCWeatherStation) {
    if (!station) return;

    this.primaryLocation = station;

    eventbus.emit(EVENT_BUS_CONFIG_CHANGE_PRIMARY_LOCATION, true);
  }

  public setProvinceStations(isEnabled: boolean, stations: ProvinceStations) {
    this.provinceHighLowEnabled = isEnabled;
    if (stations?.length) this.provinceStations = mergeProvinceStationClimateDefaults(stations);

    eventbus.emit(EVENT_BUS_CONFIG_CHANGE_PROVINCE_TRACKING, true);
  }

  public setHistoricalDataStationID(id: number) {
    if (!id || isNaN(id)) return;

    this.historicalDataStationID = id;
    eventbus.emit(EVENT_BUS_CONFIG_CHANGE_HISTORICAL_TEMP_PRECIP, true);
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

    eventbus.emit(EVENT_BUS_CONFIG_CHANGE_CLIMATE_NORMALS, true);
  }

  public regenerateAvailableFlavours() {
    this.checkFlavoursDirectory();
  }

  public setMiscSettings(
    rejectInHourConditionUpdates: boolean,
    alternateRecordsSource: string,
    refreshMode: RefreshMode = this.misc.refreshMode ?? "observation"
  ) {
    this.misc.refreshMode = refreshMode;
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

    eventbus.emit(EVENT_BUS_CONFIG_CHANGE_AIR_QUALITY_STATION, true);
  }

  public setCrawlerMessages(crawler: string[]) {
    this.crawlerMessages.splice(
      0,
      this.crawlerMessages.length,
      ...crawler.map((message) => message.trim()).filter((message) => message.length)
    );
    this.saveCrawlerMessages();
  }

  /** Replaces all of the info screens. Expects them to have been through `parseInfoScreens` already. */
  public setInfoScreens(infoScreens: InfoScreenEntry[]) {
    const previousInfoScreens = this.infoScreens;
    this.infoScreens = infoScreens;

    try {
      this.saveInfoScreens();
    } catch (err) {
      // what's in memory should be what's on disk
      this.infoScreens = previousInfoScreens;
      throw err;
    }
  }

  /** The info screens that should be on the display today (not scheduled for later, not expired). */
  get activeInfoScreens(): InfoScreenEntry[] {
    return getActiveInfoScreens(this.infoScreens);
  }

  public async regeneratePlaylist() {
    await this.checkMusicDirectoryBlocking();
  }
}

let config: Config = null;
export function initializeConfig(): Config {
  if (process.env.NODE_ENV === "test") return new Config();
  if (config) return config;

  config = new Config();
  return config;
}
