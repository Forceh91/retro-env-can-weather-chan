import axios from "lib/backendAxios";
import { getDayOfYearAdjustedForLeapDay } from "lib/date";
import Logger from "lib/logger";
import { TempRecordDays } from "types";

const logger = new Logger("TempRecord");

export async function getTempRecordForDate(source: string, date: Date = new Date()) {
  logger.log("Fetching temp records for", date.toISOString());

  try {
    // fetch the data
    const resp = await axios.get<TempRecordDays>(source);
    const { data } = resp;
    if (!data || !data.records?.length) return;

    // get the info for this day of year
    const dayOfYear = getDayOfYearAdjustedForLeapDay(date);
    if (!dayOfYear) return;

    // and return it if we got a valid day of year
    return data.records[dayOfYear - 1];
  } catch (e) {
    logger.error("Failed to fetch temp records", e);
  }
}
