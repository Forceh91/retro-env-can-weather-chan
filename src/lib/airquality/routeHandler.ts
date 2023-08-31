import { Request, Response } from "express";
import { initializeAirQuality } from "lib/eccc";
import { doesAQHINeedWarning, getTextSummaryOfAQHI } from "./utils";

const airQuality = initializeAirQuality();

export function getAirQuality(req: Request, res: Response) {
  res.status(200).json({
    ...airQuality.observation,
    textValue: getTextSummaryOfAQHI(airQuality.observation?.value),
    showWarning: doesAQHINeedWarning(airQuality.observation?.value),
  });
}
