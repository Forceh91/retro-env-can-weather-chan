import { subHours } from "date-fns";
import axios from "lib/backendAxios";
import Logger from "lib/logger";

const logger = new Logger("Datamart");

/** Try recent MSC hourly buckets — listings can lag behind the current UTC hour. */
const CITYPAGE_UTC_HOUR_BUCKETS = 8;

function escapeForRegexLiteral(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function GetWeatherFileFromECCC(province: string, stationID: string): Promise<string | null> {
  // ECCC has massively changed the format of the data structure now so as of June 2025, the new format is as follows:
  // https://dd.weather.gc.ca/citypage_weather/PROVINCE/UTC_HOUR/TIMEDATE_STAMP_MSC_CitypageWeather_STATION_CODE_en.xml
  // https://dd.weather.gc.ca/citypage_weather/MB/18/20250627T180206.714Z_MSC_CitypageWeather_s0000193_en.xml

  // as of October 2025 there is now `/today` after the base url https://dd.weather.gc.ca/today/

  const provSeg = encodeURIComponent(province);
  const stationIdEscaped = escapeForRegexLiteral(stationID);
  const regex = new RegExp(`href="([^"]*MSC_CitypageWeather_${stationIdEscaped}_en\\.xml)"`, "gi");

  for (let hourIx = 0; hourIx < CITYPAGE_UTC_HOUR_BUCKETS; hourIx++) {
    const utcHour = subHours(new Date(), hourIx).getUTCHours();
    const paddedUTCHour = `${utcHour}`.padStart(2, "0");
    const baseURL = `https://dd.weather.gc.ca/today/citypage_weather/${provSeg}/${paddedUTCHour}/`;

    try {
      const resp = await axios.get(baseURL);
      const rawData = resp && (resp.data as string);
      if (!rawData) continue;

      const matches = [...rawData.matchAll(regex)].map((m) => m[1]);
      if (matches.length) {
        const latest = matches.sort().at(-1);
        if (latest) return `${baseURL}${latest}`;
      }
    } catch (err) {
      logger.error(province, paddedUTCHour, "failed to fetch data", err);
    }
  }

  return null;
}

export { GetWeatherFileFromECCC };
