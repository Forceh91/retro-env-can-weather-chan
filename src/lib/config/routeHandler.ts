import { Request, Response } from "express";
import { initializeConfig } from "./config";
import { parseInfoScreens } from "lib/infoscreen";
import { REFRESH_MODES } from "consts/refresh.consts";
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
      refreshMode: config.misc?.refreshMode,
    },
    crawler: config.crawlerMessages,
    infoScreens: config.activeInfoScreens,
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
    body: { rejectInHourConditionUpdates, alternateRecordsSource, refreshMode = config.misc.refreshMode },
  } = req ?? {};

  try {
    if (typeof rejectInHourConditionUpdates !== "boolean") throw "`rejectInHourConditionUpdates` must be true/false";
    if (typeof alternateRecordsSource !== "string") throw "`alternateRecordsSource` must be a string";

    if (!REFRESH_MODES.some((mode) => mode.value === refreshMode)) throw "`refreshMode` is not a valid refresh mode";

    config.updateAndSaveConfigOption(() =>
      config.setMiscSettings(rejectInHourConditionUpdates, alternateRecordsSource, refreshMode)
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

export function postInfoScreens(req: Request, res: Response) {
  const {
    body: { infoScreens },
  } = req ?? {};

  try {
    const { entries, errors } = parseInfoScreens(infoScreens);
    if (errors.length) {
      res.status(400).json({ error: errors.join(". ") });
      return;
    }

    config.setInfoScreens(entries);

    // send them back as saved, because any that didn't have an id have been given one
    res.json({ infoScreens: config.infoScreens });
  } catch (e) {
    res.status(500).json({ error: "Unable to save info screens" });
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

export async function postPlaylist(req: Request, res: Response) {
  try {
    await config.regeneratePlaylist();
    res.send(config.musicPlaylist);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
