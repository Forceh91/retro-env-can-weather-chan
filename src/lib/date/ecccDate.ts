import { format } from "date-fns";
import { getIsWinterSeason } from "./season";

export function ecccDateStringToTSDate(date: string) {
  // JS doesn't see atlantic and newfoundland standard/daylight time as a valid time for some reason
  const fixedTimezone = date
    .replace("ADT", "GMT-0300")
    .replace("AST", "GMT-0400")
    .replace("NDT", "GMT-0230")
    .replace("NST", "GMT-0330");

  return new Date(fixedTimezone.replace(" at", "").replace(",", ""));
}

export function getShorthandMonthNamesForSeason(stopAtCurrentMonth: boolean, date: Date = new Date()) {
  let months = ["apr", "may", "jun", "jul", "aug", "sep"];
  if (getIsWinterSeason(date.getMonth() + 1)) months = ["oct", "nov", "dec", "jan", "feb", "mar"];

  if (stopAtCurrentMonth) {
    const currMonth = format(date.getTime(), "MMM").toLowerCase();
    const currMonthIx = months.indexOf(currMonth);
    if (currMonthIx !== -1) months.splice(currMonthIx + 1, months.length - 1);
  }

  return months;
}
