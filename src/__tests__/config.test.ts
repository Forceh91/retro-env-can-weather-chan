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
    expect(config.provinceTracking).toStrictEqual(exampleConfig.provinceStations);
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
    expect(config.provinceTracking).toStrictEqual(PROVINCE_TRACKING_DEFAULT_STATIONS);

    jest
      .spyOn(fs, "readFileSync")
      .mockImplementationOnce(() => JSON.stringify({ ...exampleConfig, provinceStations: [] }));

    config = initializeConfig();
    expect(config.provinceTracking).toStrictEqual(PROVINCE_TRACKING_DEFAULT_STATIONS);
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
