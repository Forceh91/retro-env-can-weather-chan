import { Request, Response } from "express";
import { initializeConfig } from "./config";
import { getECCCWeatherStations } from "lib/eccc";

const config = initializeConfig();

export function getConfigHandler(req: Request, res: Response) {
  res.json({
    config: config.config,
    crawler: config.crawlerMessages,
    flavour: config.flavour,
    music: config.musicPlaylist,
  });
}

export function getInitHandler(req: Request, res: Response) {
  res.json({
    config: { font: config.lookAndFeel.font, provinceHighLowEnabled: config.provinceHighLowEnabled },
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

    config.setPrimaryLocation(station);
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

    config.setProvinceStations(isEnabled, stations);
    res.sendStatus(200);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
