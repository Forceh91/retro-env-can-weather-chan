import { Request, Response } from "express";
import { initializeCurrentConditions } from "./conditions";
import { isSunSpotSeason, isWindchillSeason, getIsWinterSeason } from "lib/date";
import { initializeAlertMonitor } from "./alertMonitor";
import { CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT, CONDITIONS_EVENT_STREAM_INTERVAL } from "consts";
import { initializeNationalWeather } from "lib/national";

const conditions = initializeCurrentConditions();
const nationalWeather = initializeNationalWeather();
const alertMonitor = initializeAlertMonitor();

export function getObserved(req: Request, res: Response) {
  res.json(conditions.observed());
}

export function getForecast(req: Request, res: Response) {
  res.json(conditions.forecast());
}

export function getAlmanac(req: Request, res: Response) {
  res.json(conditions.almanac());
}

export function getSeasons(req: Request, res: Response) {
  res.json({
    windchill: isWindchillSeason(),
    sunspot: isSunSpotSeason(),
    winter: getIsWinterSeason(),
  });
}

export function getAlerts(req: Request, res: Response) {
  res.json(alertMonitor.alerts());
}

let eventStreamInterval: NodeJS.Timer = null;
export function getLive(req: Request, res: Response) {
  // write the head
  res.writeHead(200, {
    connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
  });

  // clear old interval to update this
  eventStreamInterval && clearInterval(eventStreamInterval);

  // write an event stream (periodically)
  writeEventStream(res);
  eventStreamInterval = setInterval(() => writeEventStream(res), CONDITIONS_EVENT_STREAM_INTERVAL);
}

function writeEventStream(res: Response) {
  res.write(`id: ${Date.now()}\n`);
  res.write(`event: ${CONDITIONS_EVENT_STREAM_CONDITION_UPDATE_EVENT}\n`);
  res.write(`data: ${JSON.stringify(conditions.observed())}\n\n`);
}

export function getNational(req: Request, res: Response) {
  res.json(nationalWeather.nationalWeather());
}
