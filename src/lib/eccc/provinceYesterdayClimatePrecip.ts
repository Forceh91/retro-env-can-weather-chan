import axios from "lib/backendAxios";
import { formatFetchError, looksLikeClimatedataXml } from "lib/eccc/fetchErrors";
import Logger from "lib/logger";
import { ElementCompact, xml2js } from "xml-js";
import { subDays } from "date-fns";

const logger = new Logger("ProvinceClimatePrecip");

function xmlText(el: unknown): string | undefined {
  if (el == null) return undefined;
  if (typeof el === "string" || typeof el === "number") return String(el).trim();
  const o = el as { _text?: string | number };
  if (o._text !== undefined && o._text !== null) return String(o._text).trim();
  return undefined;
}

function dailyPrecipitationMm(row: { totalprecipitation?: unknown; totalrain?: unknown }): number {
  const raw = xmlText(row.totalprecipitation) ?? xmlText(row.totalrain);
  if (raw == null || raw === "") return 0;
  const u = raw.toUpperCase();
  if (u === "T" || u === "M") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function dailySnowCm(row: { totalsnow?: unknown }): number {
  const raw = xmlText(row.totalsnow);
  if (raw == null || raw === "") return 0;
  const u = raw.toUpperCase();
  if (u === "T" || u === "M") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

type CacheEntry = { value: { amount: number; unit: string } | null; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const DEFAULT_TTL_MS = 45 * 60 * 1000;
const MISS_TTL_MS = 12 * 60 * 1000;

function bulkMonthlyUrl(stationId: number, year: number, month: number): string {
  return `https://climate.weather.gc.ca/climate_data/bulk_data_e.html?format=xml&stationID=${stationId}&Year=${year}&Month=${month}&Day=1&timeframe=2`;
}

function rowMatchesCalendarDay(
  row: { _attributes?: { year?: string | number; month?: string | number; day?: string | number } },
  y: number,
  m: number,
  day: number
): boolean {
  const a = row._attributes;
  if (!a) return false;
  return Number(a.year) === y && Number(a.month) === m && Number(a.day) === day;
}

/**
 * Yesterday liquid/snow totals from ECCC historical daily bulk (same source as historical temp/precip),
 * aligned to the calendar day before {@link observedAtStation}.
 */
export async function fetchYesterdayPrecipFromClimateBulk(
  climateStationId: number,
  observedAtStation: Date
): Promise<{ amount: number; unit: string } | null> {
  const yday = subDays(observedAtStation, 1);
  const y = yday.getFullYear();
  const m = yday.getMonth() + 1;
  const day = yday.getDate();
  const cacheKey = `${climateStationId}:${y}-${m}-${day}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && hit.expiresAt > now) return hit.value;

  const setCache = (value: { amount: number; unit: string } | null, ttl: number) => {
    cache.set(cacheKey, { value, expiresAt: now + ttl });
  };

  try {
    const url = bulkMonthlyUrl(climateStationId, y, m);
    const resp = await axios.get(url, { responseType: "text" });
    const data = resp?.data;
    const raw = typeof data === "string" ? data : data != null ? String(data) : "";
    if (!raw || !looksLikeClimatedataXml(raw)) {
      logger.warn("Climate bulk response not XML for station", climateStationId);
      setCache(null, MISS_TTL_MS);
      return null;
    }

    let doc: ElementCompact;
    try {
      doc = xml2js(raw, { compact: true }) as ElementCompact;
    } catch (parseErr) {
      logger.warn("Climate bulk XML parse failed:", formatFetchError(parseErr));
      setCache(null, MISS_TTL_MS);
      return null;
    }

    const climateData = doc?.climatedata as ElementCompact | undefined;
    const stationData = climateData?.stationdata;
    if (!stationData) {
      setCache(null, MISS_TTL_MS);
      return null;
    }

    const rows = Array.isArray(stationData) ? stationData : [stationData];
    const row = rows.find((r) => rowMatchesCalendarDay(r as never, y, m, day)) as
      | { totalprecipitation?: unknown; totalrain?: unknown; totalsnow?: unknown }
      | undefined;

    if (!row) {
      setCache(null, MISS_TTL_MS);
      return null;
    }

    const snow = dailySnowCm(row);
    const rainMm = dailyPrecipitationMm(row);
    const resolved =
      snow > 0
        ? { amount: Number(snow.toFixed(1)), unit: "cm snow" }
        : { amount: Number(rainMm.toFixed(1)), unit: "mm" };

    setCache(resolved, DEFAULT_TTL_MS);
    return resolved;
  } catch (err) {
    logger.warn(`Climate bulk yesterday precip failed (station ${climateStationId}):`, formatFetchError(err));
    setCache(null, MISS_TTL_MS);
    return null;
  }
}
