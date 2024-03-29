import { getDayOfYear, getDaysInYear } from "date-fns";

export function getDayOfYearAdjustedForLeapDay(date: Date = new Date()) {
  // returns the current day of the year (1-366) and if its a leap year will offset by 1 so that Dec 31st will always be day 366
  const isLeapYear = getDaysInYear(date) === 366;
  const dayOfYear = getDayOfYear(date);
  const month = date.getMonth() + 1;

  // adjust by a day of its not a leap year and we're past feb
  return dayOfYear + (!isLeapYear && month > 2 ? 1 : 0);
}

export function isStartOfMonth(date: Date = new Date()) {
  return date.getDate() <= 5;
}
