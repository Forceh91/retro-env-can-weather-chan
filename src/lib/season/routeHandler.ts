import { Request, Response } from "express";
import { getIsWinterSeason, isSunSpotSeason, isWindchillSeason } from "lib/date";
import { initializeClimateNormals, initializeHistoricalTempPrecip } from "lib/eccc";

const historicalData = initializeHistoricalTempPrecip();
const climateNormals = initializeClimateNormals();

export function getSeasonData(req: Request, res: Response) {
  const { season, ...seasonPrecipData } = historicalData.seasonPrecipData();

  res.json({
    season: {
      windchill: isWindchillSeason(),
      sunspot: isSunSpotSeason(),
      winter: getIsWinterSeason(),
    },
    seasonPrecip: {
      ...seasonPrecipData,
      normal: climateNormals.getNormalPrecipForCurrentSeason()?.amount,
    },
  });
}
