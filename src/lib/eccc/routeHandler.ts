import { Request, Response } from "express";
import { initializeCurrentConditions } from "./conditions";

const conditions = initializeCurrentConditions();

export function getObserved(req: Request, res: Response) {
  res.json(conditions.observed());
}
