import { Request, Response } from "express";
import { initializeCurrentConditions } from "./conditions";
import { isSunSpotSeason, isWindchillSeason, isWinterSeason } from "lib/date";

const conditions = initializeCurrentConditions();

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
    winter: isWinterSeason(),
  });
}
