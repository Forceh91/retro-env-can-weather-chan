import { format } from "date-fns";
import { getIsWinterSeason } from "./season";

export function ecccDateStringToTSDate(date: string) {
  return new Date(date.replace(" at", "").replace(",", ""));
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
