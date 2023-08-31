import { AIR_QUALITY_BAD, AIR_QUALITY_FAIR, AIR_QUALITY_POOR } from "consts";

export function getTextSummaryOfAQHI(aqhi: number) {
  if (aqhi > AIR_QUALITY_BAD) return "Bad";
  if (aqhi >= AIR_QUALITY_POOR) return "Poor";
  if (aqhi >= AIR_QUALITY_FAIR) return "Fair";
  else return "Good";
}

export function doesAQHINeedWarning(aqhi: number) {
  return aqhi >= AIR_QUALITY_FAIR;
}
