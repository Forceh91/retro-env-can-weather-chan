import { Request, Response } from "express";
import { initializeConfig } from "./config";
import { getECCCWeatherStations } from "lib/eccc/weatherStations";

const config = initializeConfig();

export function getConfigHandler(req: Request, res: Response) {
  res.json({
    config: config.config,
    crawler: config.crawlerMessages,
    music: config.musicPlaylist ?? [],
  });
}

export function getInitHandler(req: Request, res: Response) {
  res.json({
    config: {
      font: config.lookAndFeel.font,
      provinceHighLowEnabled: config.provinceHighLowEnabled,
      configVersion: config.configVersion,
    },
    crawler: config.crawlerMessages,
    flavour: config.flavour,
    music: config.musicPlaylist ?? [],
  });
}

export async function postStationsHandler(req: Request, res: Response) {
  const {
    body: { search = "" },
  } = req ?? {};

  try {
    res.json({ results: await getECCCWeatherStations(search) });
  } catch (e) {
    res.status(500).json({ error: "Unable to search weather stations" });
  }
}

export function postPrimaryLocation(req: Request, res: Response) {
  const {
    body: { station },
  } = req ?? {};

  try {
    if (!station) throw "Missing `station` parameter";

    config.updateAndSaveConfigOption(() => config.setPrimaryLocation(station));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postProvinceTracking(req: Request, res: Response) {
  const {
    body: { isEnabled, stations },
  } = req ?? {};

  try {
    if (!Array.isArray(stations)) throw "Invalid `stations` parameter";

    config.updateAndSaveConfigOption(() => config.setProvinceStations(isEnabled, stations));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postHistoricalDataStationID(req: Request, res: Response) {
  const {
    body: { historicalDataStationID },
  } = req ?? {};

  try {
    if (isNaN(historicalDataStationID)) throw "Invalid type of `historicalDataStationID` provided";

    config.updateAndSaveConfigOption(() => config.setHistoricalDataStationID(historicalDataStationID));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postClimateNormals(req: Request, res: Response) {
  const {
    body: { climateID, stationID, province },
  } = req ?? {};

  try {
    if (isNaN(climateID)) throw "Invalid type of `climateID` provided";
    if (isNaN(stationID)) throw "Invalid type of `stationID` provided";
    if (!province.length || typeof province !== "string") throw "Invalid type of `province` provided";

    config.updateAndSaveConfigOption(() => config.setClimateNormals(climateID, stationID, province));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postMisc(req: Request, res: Response) {
  const {
    body: { rejectInHourConditionUpdates, alternateRecordsSource },
  } = req ?? {};

  try {
    if (typeof rejectInHourConditionUpdates !== "boolean") throw "`rejectInHourConditionUpdates` must be true/false";
    if (typeof alternateRecordsSource !== "string") throw "`alternateRecordsSource` must be a string";

    config.updateAndSaveConfigOption(() =>
      config.setMiscSettings(rejectInHourConditionUpdates, alternateRecordsSource)
    );
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postLookAndFeel(req: Request, res: Response) {
  const {
    body: { flavour },
  } = req ?? {};

  try {
    if (typeof flavour !== "string") throw "`flavour` must be a string";
    if (flavour && !config.flavours.includes(flavour)) throw "Provided `flavour` doesn't exist";

    config.updateAndSaveConfigOption(() => config.setLookAndFeelSettings(flavour));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postCrawlerMessages(req: Request, res: Response) {
  const {
    body: { crawler },
  } = req ?? {};

  try {
    if (!Array.isArray(crawler)) throw "`crawler` must be an array of strings";

    config.setCrawlerMessages(crawler);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postAirQualityStation(req: Request, res: Response) {
  const {
    body: { station },
  } = req ?? {};

  try {
    if (typeof station === "undefined") throw "Missing `station` parameter";

    config.updateAndSaveConfigOption(() => config.setAirQualityStation(station));
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}

export function postPlaylist(req: Request, res: Response) {
  try {
    config.regeneratePlaylist();
    res.send(config.musicPlaylist);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
