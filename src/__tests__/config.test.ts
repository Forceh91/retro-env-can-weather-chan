jest.mock("fs");
import { initializeConfig } from "lib/config/config";
import fs from "fs";
import exampleConfig from "./testdata/config/exampleConfig.json";
import { FLAVOUR_DEFAULT } from "consts/flavour.consts";
import { DEFAULT_WEATHER_STATION_ID } from "consts/server.consts";
import { PROVINCE_TRACKING_DEFAULT_STATIONS } from "consts/provincetracking.consts";
import { FS_NO_FILE_FOUND } from "consts/storage.consts";

const defaultPrimaryLocation = {
  province: "MB",
  location: DEFAULT_WEATHER_STATION_ID,
  name: "Winnipeg",
};

describe("Config file loading", () => {
  it("loads from file correctly", () => {
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify(exampleConfig));

    const config = initializeConfig();
    expect(config.primaryLocation).toStrictEqual(exampleConfig.primaryLocation);
    expect(config.provinceHighLowEnabled).toStrictEqual(exampleConfig.provinceHighLowEnabled);
    expect(config.provinceStations).toStrictEqual(exampleConfig.provinceStations);
    expect(config.historicalDataStationID).toStrictEqual(exampleConfig.historicalDataStationID);
    expect(config.climateNormals).toStrictEqual(exampleConfig.climateNormals);
    expect(config.lookAndFeel).toStrictEqual({ font: "vt323", flavour: FLAVOUR_DEFAULT.name });
    expect(config.misc).toStrictEqual({ ...exampleConfig.misc, alternateRecordsSource: undefined });
    expect(config.flavour.name).toStrictEqual(FLAVOUR_DEFAULT.name);
    expect(config.flavour.screens).toStrictEqual(FLAVOUR_DEFAULT.screens);
    expect(config.musicPlaylist).toHaveLength(0);
    expect(config.crawlerMessages).toHaveLength(0);
  });

  it("loads from file correctly when primary location is missing", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, primaryLocation: undefined }));

    const config = initializeConfig();
    expect(config.primaryLocation).toStrictEqual(defaultPrimaryLocation);
  });

  it("loads from file correctly when provincehighlowenabled is missing", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, provinceHighLowEnabled: undefined }));

    let config = initializeConfig();
    expect(config.provinceHighLowEnabled).toStrictEqual(true);

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, provinceHighLowEnabled: false }));

    config = initializeConfig();
    expect(config.provinceHighLowEnabled).toStrictEqual(false);
  });

  it("loads from file correctly when historical data station id is missing", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, historicalDataStationID: undefined }));

    const config = initializeConfig();
    expect(config.historicalDataStationID).toStrictEqual(27174);
  });

  it("loads from file correctly when climate normals is missing", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, climateNormals: undefined }));

    let config = initializeConfig();
    expect(config.climateNormals).toStrictEqual({
      stationID: 3698,
      climateID: 5023222,
      province: "MB",
    });

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, climateNormals: {} }));

    config = initializeConfig();
    expect(config.climateNormals).toStrictEqual({
      stationID: 3698,
      climateID: 5023222,
      province: "MB",
    });
  });

  it("loads from file correctly when climate normals is partially present", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, climateNormals: { province: "ON" } }));

    const config = initializeConfig();
    expect(config.climateNormals).toStrictEqual({
      stationID: 3698,
      climateID: 5023222,
      province: "ON",
    });
  });

  it("loads from file correctly when lookAndFeel is missing", () => {
    const defaultLookAndFeel = { font: "vt323", flavour: "default" };
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, lookAndFeel: undefined }));

    let config = initializeConfig();
    expect(config.lookAndFeel).toStrictEqual(defaultLookAndFeel);

    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, lookAndFeel: {} }));

    config = initializeConfig();
    expect(config.lookAndFeel).toStrictEqual(defaultLookAndFeel);
  });

  it("loads from file correctly when misc is missing", () => {
    const defaultMisc: { rejectInHourConditionUpdates: boolean; alternateRecordsSource?: string } = {
      rejectInHourConditionUpdates: false,
      alternateRecordsSource: undefined,
    };
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, misc: undefined }));

    let config = initializeConfig();
    expect(config.misc).toStrictEqual(defaultMisc);

    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, misc: {} }));

    config = initializeConfig();
    expect(config.misc).toStrictEqual(defaultMisc);
  });

  it("loads from file correctly when provinceStations is missing", () => {
    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, provinceStations: undefined }));

    let config = initializeConfig();
    expect(config.provinceStations).toStrictEqual(PROVINCE_TRACKING_DEFAULT_STATIONS);

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, provinceStations: [] }));

    config = initializeConfig();
    expect(config.provinceStations).toStrictEqual(PROVINCE_TRACKING_DEFAULT_STATIONS);
  });

  it("handles the config file being corrupted", () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce("this is not json");

    const config = initializeConfig();
    expect(config.config).not.toBeFalsy();
    expect(config.primaryLocation).toStrictEqual(defaultPrimaryLocation);
  });

  it("handles the config file not existing", () => {
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => {
      throw { code: FS_NO_FILE_FOUND };
    });

    const config = initializeConfig();
    expect(config.config).not.toBeFalsy();
    expect(config.primaryLocation).toStrictEqual(defaultPrimaryLocation);
  });

  it("loads crawler messages from file correctly", () => {
    const crawlers = ["crawler 1", "crawler 2", "crawler 3"];
    jest.spyOn(fs, "readFileSync").mockImplementation(() => crawlers.join("\n"));

    const config = initializeConfig();
    expect(config.crawlerMessages).toStrictEqual(crawlers);
  });

  it("loads crawler messages from an empty file correctly", () => {
    jest.spyOn(fs, "readFileSync").mockImplementation(() => "");

    const config = initializeConfig();
    expect(config.crawlerMessages).toStrictEqual([]);
  });

  it("handles the crawler messages file not existing", () => {
    jest.spyOn(fs, "readFileSync").mockImplementation(() => {
      throw { code: FS_NO_FILE_FOUND };
    });

    const config = initializeConfig();
    expect(config.crawlerMessages).toStrictEqual([]);
  });
});

describe("Config updating", () => {
  it("updates the primary location correctly", () => {
    const config = initializeConfig();

    const newPrimaryLocation = {
      province: "MB",
      location: DEFAULT_WEATHER_STATION_ID,
      name: "Winnipeg",
    };

    config.setPrimaryLocation(newPrimaryLocation);
    expect(config.primaryLocation).toStrictEqual(newPrimaryLocation);
  });

  it("updates the province tracking correcty", () => {
    const config = initializeConfig();

    const newStations = [PROVINCE_TRACKING_DEFAULT_STATIONS[2]];
    config.setProvinceStations(true, newStations);
    expect(config.provinceHighLowEnabled).toBeTruthy();
    expect(config.provinceStations).toStrictEqual(newStations);

    config.setProvinceStations(false, newStations);
    expect(config.provinceHighLowEnabled).toBeFalsy();
    expect(config.provinceStations).toStrictEqual(newStations);

    config.setProvinceStations(true, []);
    expect(config.provinceHighLowEnabled).toBeTruthy();
    expect(config.provinceStations).toStrictEqual(newStations);
  });

  it("updates the historical data station ID correctly", () => {
    const config = initializeConfig();
    const originalID = config.historicalDataStationID;

    config.setHistoricalDataStationID(Number("abc"));
    expect(config.historicalDataStationID).toBe(originalID);

    const newID = 512;
    config.setHistoricalDataStationID(newID);
    expect(config.historicalDataStationID).toBe(newID);
  });

  it("updates the climate normals correctly", () => {
    const config = initializeConfig();
    const climateNormals = config.climateNormals;

    config.setClimateNormals(Number("abc"), Number("abc"), "blah");
    expect(config.climateNormals).toStrictEqual(climateNormals);

    config.setClimateNormals(23, Number("abc"), "blah");
    expect(config.climateNormals).toStrictEqual(climateNormals);

    config.setClimateNormals(23, 45, "blah");
    expect(config.climateNormals).toStrictEqual(climateNormals);

    config.setClimateNormals(23, 45, "on");
    expect(config.climateNormals).toStrictEqual({ climateID: 23, stationID: 45, province: "ON" });
  });

  it("updates the misc settings correctly", () => {
    const config = initializeConfig();
    [
      { reject: true, url: "http://example.com" },
      { reject: false, url: "" },
      { reject: true, url: "" },
      { reject: false, url: "http://exampe.com" },
    ].forEach((update) => {
      config.setMiscSettings(update.reject, update.url);
      expect(config.misc).toStrictEqual({
        rejectInHourConditionUpdates: update.reject,
        alternateRecordsSource: update.url,
      });
    });
  });

  it("updates the look and feel settings correctly", () => {
    const config = initializeConfig();
    config.setLookAndFeelSettings("test");
    expect(config.lookAndFeel.flavour).toStrictEqual("test");

    config.setLookAndFeelSettings("");
    expect(config.lookAndFeel.flavour).toStrictEqual("default");
  });

  it("updates and saves the config option correctly", () => {
    const config = initializeConfig();
    const writeFile = jest.spyOn(fs, "writeFileSync").mockImplementation();

    const newLocation = {
      province: "ON",
      location: "s00001",
      name: "Some ON town",
    };
    const fn = jest.fn(() => config.setPrimaryLocation(newLocation));
    config.updateAndSaveConfigOption(fn);

    expect(writeFile).toHaveBeenCalled();
    expect(fn).toHaveBeenCalled();
    expect(config.primaryLocation).toStrictEqual(newLocation);
  });

  it("updates the crawler messages correctly", () => {
    const config = initializeConfig();
    const writeFile = jest.spyOn(fs, "writeFileSync").mockImplementation();

    const newCrawlerMessages = ["a crawler", "and another one", "and a third one"];
    config.setCrawlerMessages(newCrawlerMessages);
    expect(config.crawlerMessages).toStrictEqual(newCrawlerMessages);

    config.setCrawlerMessages([...newCrawlerMessages, "   ", ""]);
    expect(config.crawlerMessages).toStrictEqual(newCrawlerMessages);
    expect(writeFile).toHaveBeenCalled();
  });

  it("updates the air quality station settings correctly", () => {
    const config = initializeConfig();
    config.setAirQualityStation("ont/abcd");
    expect(config.airQualityStation).toStrictEqual("ont/abcd");

    config.setAirQualityStation("");
    expect(config.airQualityStation).toBeFalsy();
  });
});
