import { format } from "date-fns";
import { getIsWinterSeason } from "./season";

export function ecccDateStringToTSDate(date: string) {
  return new Date(date.replace(" at", "").replace(",", ""));
}

export function getShorthandMonthNamesForSeason(stopAtCurrentMonth: boolean) {
  let months = ["apr", "may", "jun", "jul", "aug", "sep"];
  if (getIsWinterSeason()) months = ["oct", "nov", "dec", "jan", "feb"];

  if (stopAtCurrentMonth) {
    const currMonth = format(Date.now(), "MMM").toLowerCase();
    const currMonthIx = months.indexOf(currMonth);
    if (currMonthIx !== -1) months.splice(currMonthIx + 1, months.length - 1);
  }

  return months;
}
