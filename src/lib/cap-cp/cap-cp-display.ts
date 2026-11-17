import { CAPObject, CAPSeverity } from "types";

export function shouldAlertFlash(alert: CAPObject) {
  if (!alert) return false;

  // doing this because these seem to get sent over as at least moderate. but we also want some things that are moderate to flash
  if (["statement", "advisory"].some((warningType) => alert.headline?.toLowerCase().includes(warningType)))
    return false;

  return alert.severity >= CAPSeverity.MODERATE;
}

// ECCC colour-coded alerts now arrive as "<colour> <level> - <type> - <status>" (e.g. "yellow warning - snowfall - in effect")
// the simulator-era format is "<type> <level> <status>" (e.g. "snowfall warning in effect") so we convert it back
const COLOUR_CODED_HEADLINE = /^\s*(?:yellow|orange|red)\s+(watch|warning|advisory)\s*[-–—]\s*(.+?)\s*[-–—]\s*(in effect|ended)\s*$/i;

export function normalizeAlertHeadline(headline: string) {
  if (!headline?.length) return "";

  const match = headline.match(COLOUR_CODED_HEADLINE);
  if (!match) return headline;

  const [, level, type, status] = match;
  return `${type.trim()} ${level} ${status}`;
}

export function cleanupAlertHeadline(headline: string) {
  if (!headline?.length) return "";

  return normalizeAlertHeadline(headline).replace(/\sin effect/gi, "");
}

export function isWarningSevereThunderstormWatch(headline: string) {
  return normalizeAlertHeadline(headline).toLowerCase() === "severe thunderstorm watch in effect";
}
