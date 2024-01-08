import { Request, Response } from "express";
import { getIsWinterSeason, isSunSpotSeason, isWindchillSeason } from "lib/date";
import { initializeClimateNormals, initializeHistoricalTempPrecip } from "lib/eccc";

const historicalData = initializeHistoricalTempPrecip();
const climateNormals = initializeClimateNormals();

export function getSeasonData(req: Request, res: Response) {
  res.json({
    season: {
      windchill: isWindchillSeason(),
      sunspot: isSunSpotSeason(),
      winter: getIsWinterSeason(),
    },
    seasonPrecip: {
      ...historicalData.seasonPrecipData(),
      normal: climateNormals.getNormalPrecipForCurrentSeason()?.amount,
    },
  });
}

export function getLastMonthSummary(req: Request, res: Response) {
  const lastMonthSummary = historicalData.lastMonthSummary();
  const lastMonthNormal = climateNormals.getNormalsForLastMonth();

  res.json({ actual: lastMonthSummary, normal: lastMonthNormal });
}
