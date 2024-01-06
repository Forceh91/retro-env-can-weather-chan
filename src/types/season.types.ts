import { HistoricalPrecipData } from "./condition.types";

export type Season = {
  season: {
    windchill: boolean;
    sunspot: boolean;
    winter: boolean;
  };
  seasonPrecip: HistoricalPrecipData;
};
