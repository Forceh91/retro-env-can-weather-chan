import { Request, Response } from "express";
import { initializeAirQuality } from "lib/eccc";
import { doesAQHINeedWarning, getAQHITextSummary } from "./utils";

const airQuality = initializeAirQuality();

export function getAirQuality(req: Request, res: Response) {
  res.status(200).json({
    ...airQuality.observation,
    textValue: getAQHITextSummary(airQuality.observation?.value),
    showWarning: doesAQHINeedWarning(airQuality.observation?.value),
  });
}
