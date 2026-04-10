import { subHours } from "date-fns";
import { isAxiosError } from "axios";
import axios from "lib/backendAxios";
import Logger from "lib/logger";
import {
  rwcDatamartHourlyDirExtraRetries,
  rwcDatamartHourlyDirRetryDelayMs,
} from "consts/reliability.consts";
import {
  axiosGetWithMscMirrorResolved,
  axiosHeadWithMscMirror,
  MSC_HPFX_ORIGIN,
} from "lib/eccc/mscHttpMirror";

const logger = new Logger("Datamart");

function formatDatamartFetchError(err: unknown): string {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const url = err.config?.url ?? "unknown URL";
    if (status) return `${status} ${url}`;
    return err.message || "axios error";
  }
  if (err instanceof Error) return err.message;
  return String(err);
}

/**
 * Citypage buckets under `/today/citypage_weather/…/<UTC hour two digits>/` can lag; try several hours.
 * (Datamart mirror: https://dd.weather.gc.ca/… — listing + file must use the same host that served the index.)
 */
const CITYPAGE_UTC_HOUR_FALLBACKS = 8;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * True when the hourly directory request might succeed after a short wait (new hour not published yet, transient upstream).
 */
function isMscHourlyDirectoryMaybeNotPublished(err: unknown): boolean {
  if (!isAxiosError(err)) return true;
  if (err.code === "ERR_CANCELED") return false;
  const s = err.response?.status;
  if (s == null) return true;
  if (s === 404 || s === 403) return true;
  if (s >= 500) return true;
  if (s === 408 || s === 429) return true;
  return false;
}

function englishCitypageHrefPattern(stationID: string): RegExp {
  const escaped = stationID.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`href="([^"]*MSC_CitypageWeather_${escaped}_en\\.xml)"`, "gi");
}

/**
 * Resolve the latest English citypage XML URL for a station.
 * Uses the hourly directory layout on MSC mirrors (HPFX / Datamart).
 */
async function GetWeatherFileFromECCC(province: string, stationID: string): Promise<string | null> {
  const utcHoursToTry = Array.from({ length: CITYPAGE_UTC_HOUR_FALLBACKS }, (_, i) =>
    subHours(new Date(), i).getUTCHours()
  );

  const regex = englishCitypageHrefPattern(stationID);
  const extraDirRetries = rwcDatamartHourlyDirExtraRetries();
  const dirRetryDelayMs = rwcDatamartHourlyDirRetryDelayMs();

  hourLoop: for (let hourIx = 0; hourIx < utcHoursToTry.length; hourIx++) {
    const utcHour = utcHoursToTry[hourIx]!;
    const paddedUTCHour = `${utcHour}`.padStart(2, "0");
    const baseURL = `${MSC_HPFX_ORIGIN}/today/citypage_weather/${encodeURIComponent(province)}/${paddedUTCHour}/`;

    const maxDirAttempts = hourIx === 0 ? 1 + extraDirRetries : 1;

    for (let attempt = 0; attempt < maxDirAttempts; attempt++) {
      if (attempt > 0) {
        const jitter = Math.floor(Math.random() * 2000);
        await sleep(dirRetryDelayMs + jitter);
      }

      let html: string | undefined;
      let directoryResolvedUrl: string | undefined;
      let lastDirErr: unknown;

      try {
        const { response, resolvedUrl } = await axiosGetWithMscMirrorResolved(axios, baseURL);
        directoryResolvedUrl = resolvedUrl;
        html = response.data as string;
        lastDirErr = undefined;
      } catch (err) {
        lastDirErr = err;
        if (attempt < maxDirAttempts - 1 && isMscHourlyDirectoryMaybeNotPublished(err)) {
          continue;
        }
        logger.warn(
          `Citypage hourly directory ${province}/${paddedUTCHour}Z listing failed (${formatDatamartFetchError(lastDirErr)})`
        );
        continue hourLoop;
      }

      if (!html) {
        if (hourIx === 0 && attempt < maxDirAttempts - 1) {
          continue;
        }
        logger.warn(`Citypage hourly directory ${province}/${paddedUTCHour}Z: empty listing body`);
        continue hourLoop;
      }
      if (!directoryResolvedUrl) {
        continue hourLoop;
      }

      const hrefs = [...html.matchAll(regex)].map((m) => m[1]);
      const unique = [...new Set(hrefs)];

      if (!unique.length) {
        if (hourIx === 0 && attempt < maxDirAttempts - 1) {
          continue;
        }
        continue hourLoop;
      }

      const newestFirst = unique.sort().reverse();
      const dirBase = directoryResolvedUrl.endsWith("/") ? directoryResolvedUrl : `${directoryResolvedUrl}/`;

      for (const file of newestFirst) {
        const fileUrl = `${dirBase}${file}`;
        try {
          await axiosHeadWithMscMirror(axios, fileUrl);
          return fileUrl;
        } catch {
          /* older or phantom listing row; try next timestamp */
        }
      }

      continue hourLoop;
    }
  }

  return null;
}

/**
 * Legacy stable English citypage path (HPFX). Datamart does not mirror `/xml/…`; use only as a last-resort
 * fallback when hourly resolution fails. {@link axiosGetWithMscMirror} still tries HPFX before Datamart.
 */
function legacyHpfxCitypageEnglishXmlUrl(province: string, stationID: string): string {
  return `${MSC_HPFX_ORIGIN}/today/citypage_weather/xml/${encodeURIComponent(province)}/${encodeURIComponent(stationID)}_e.xml`;
}

export { GetWeatherFileFromECCC, legacyHpfxCitypageEnglishXmlUrl };
