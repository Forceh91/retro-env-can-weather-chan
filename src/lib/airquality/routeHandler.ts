import { Request, Response } from "express";
import { initializeAirQuality } from "lib/eccc";
import { doesAQHINeedWarning, getAQHITextSummary } from "./utils";
import { getECCCAirQualityStations } from "lib/eccc/airQualityStations";

const airQuality = initializeAirQuality();

export function getAirQuality(req: Request, res: Response) {
  res.status(200).json({
    ...airQuality.observation,
    textValue: getAQHITextSummary(airQuality.observation?.value),
    showWarning: doesAQHINeedWarning(airQuality.observation?.value),
  });
}

export async function postStationsHandler(req: Request, res: Response) {
  const {
    body: { search = "" },
  } = req ?? {};

  try {
    res.json({ results: await getECCCAirQualityStations(search) });
  } catch (e) {
    res.status(500).json({ error: "Unable to search air quality stations" });
  }
}
