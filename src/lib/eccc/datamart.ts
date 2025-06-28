import { subHours } from "date-fns";
import axios from "lib/backendAxios";
import Logger from "lib/logger";

const logger = new Logger("Datamart");
async function GetWeatherFileFromECCC(province: string, stationID: string): Promise<string | null> {
  // ECCC has massively changed the format of the data structure now so as of June 2025, the new format is as follows:
  // https://dd.weather.gc.ca/citypage_weather/PROVINCE/UTC_HOUR/TIMEDATE_STAMP_MSC_CitypageWeather_STATION_CODE_en.xml
  // https://dd.weather.gc.ca/citypage_weather/MB/18/20250627T180206.714Z_MSC_CitypageWeather_s0000193_en.xml

  // due to this, what we're gonna do is get the current UTC hour, or the previous UTC hour
  const currentUTCHour = new Date().getUTCHours();
  const previousUTCHour = subHours(new Date(), 1).getUTCHours();

  const parser = async (utcHour: number) => {
    const baseURL = `https://dd.weather.gc.ca/citypage_weather/${province}/${utcHour}/`;
    try {
      // first we check if the directory exists
      const resp = await axios.get(baseURL);
      const rawData = resp && (resp.data as string);
      if (!rawData) return null;

      const data = rawData as string;
      // once we know it does exist we need to parse out the directory structure it gives us
      const regexPattern = /.*href="([^"]*MSC_CitypageWeather_{STATION_ID}_en\.xml)".*/;
      const regex = RegExp(`${regexPattern}`.replace("{STATION_ID}", stationID), "i");
      const [, group1] = data.match(regex);

      // group1 will always be the bit we need
      if (group1) return `${baseURL}${group1}`;
      // otherwise we found no data for this station
      else return null;
    } catch (err) {
      logger.error(province, utcHour, "failed to fetch data", err);
    }
  };

  // we can't async/await a foreach so we've gotta do this manually
  const currentResult = await parser(currentUTCHour);
  if (currentResult) return currentResult;

  return await parser(previousUTCHour);
}

export { GetWeatherFileFromECCC };
