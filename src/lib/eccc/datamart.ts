import { subHours } from "date-fns";
import axios from "lib/backendAxios";
import Logger from "lib/logger";

const logger = new Logger("Datamart");
async function GetWeatherFileFromECCC(province: string, stationID: string): Promise<string | null> {
  // ECCC has massively changed the format of the data structure now so as of June 2025, the new format is as follows:
  // https://dd.weather.gc.ca/citypage_weather/PROVINCE/UTC_HOUR/TIMEDATE_STAMP_MSC_CitypageWeather_STATION_CODE_en.xml
  // https://dd.weather.gc.ca/citypage_weather/MB/18/20250627T180206.714Z_MSC_CitypageWeather_s0000193_en.xml

  // as of October 2025 there is now `/today` after the base url https://dd.weather.gc.ca/today/

  // due to this, what we're gonna do is get the current UTC hour, or the previous UTC hour
  const currentUTCHour = new Date().getUTCHours();
  const previousUTCHour = subHours(new Date(), 1).getUTCHours();

  const parser = async (utcHour: number) => {
    const paddedUTCHour = `${utcHour}`.padStart(2, "0");
    const baseURL = `https://dd.weather.gc.ca/today/citypage_weather/${province}/${paddedUTCHour}/`;
    try {
      // first we check if the directory exists
      const resp = await axios.get(baseURL);
      const rawData = resp && (resp.data as string);
      if (!rawData) return null;

      const data = rawData as string;
      // once we know it does exist we need to parse out the directory structure it gives us
      // const regexPattern = ;
      const regex = RegExp(`href="([^"]*MSC_CitypageWeather_${stationID}_en\.xml)"`, "gi");

      // see if we get a match in here
      const matches = [...data.matchAll(regex)].map((m) => m[1]);
      if (matches) {
        const latest = matches.sort().at(-1);

        // we need to make sure we get the lastest
        // as for some reason old data can end up in the new hours directory
        if (latest) return `${baseURL}${latest}`;
      }

      // otherwise we found no data for this station
      return null;
    } catch (err) {
      logger.error(province, paddedUTCHour, "failed to fetch data");
    }

    // final fallback for return value
    return null;
  };

  // we can't async/await a foreach so we've gotta do this manually
  const currentResult = await parser(currentUTCHour);
  if (currentResult) return currentResult;

  return await parser(previousUTCHour);
}

export { GetWeatherFileFromECCC };
