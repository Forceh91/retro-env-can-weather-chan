import { Request, Response } from "express";
import { initializeCurrentConditions } from "./conditions";

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
