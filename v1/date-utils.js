const { parseISO, compareAsc, compareDesc, format, getDayOfYear, getDaysInYear } = require("date-fns");

function isWinterSeason(month) {
  // remember that months are 0 indexed
  const date = new Date();
  if (month === undefined) month = date?.getMonth();

  // if the month is october or greater, and march or less, its winter season
  return month >= 9 || month <= 2;
}

function isDateInWinterSeason(dateString) {
  const date = parseISO(dateString);
  return isWinterSeason(date.getMonth());
}

function isDateInCurrentWinterSeason(dateString) {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();
  const lastYear = date.getFullYear() - 1;
  const nextYear = date.getFullYear() + 1;

  let startOfCurrentWinterSeason = null;
  let endOfCurrentWinterSeason = null;

  // if the month is oct-dec then we want this years data
  // for oct-dec and next years data for jan-mar
  if (currentMonth >= 10) {
    startOfCurrentWinterSeason = parseISO(`${currentYear}-10-01`);
    endOfCurrentWinterSeason = parseISO(`${nextYear}-03-31`);
  } else {
    // if the month is before oct then we want last years data
    // for oct-dec and this years data for jan-mar
    startOfCurrentWinterSeason = parseISO(`${lastYear}-10-01`);
    endOfCurrentWinterSeason = parseISO(`${currentYear}-03-31`);
  }

  // winter season is october 1st to march 31st
  const dateToCheck = parseISO(dateString);

  // now we have all of our dates, we can compare them
  return (
    compareDesc(startOfCurrentWinterSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentWinterSeason, dateToCheck) !== -1
  );
}

function isDateInCurrentSummerSeason(dateString) {
  const date = new Date();
  const currentYear = date.getFullYear();

  // winter season is october 1st to march 31st
  const startOfCurrentSummerSeason = parseISO(`${currentYear}-04-01`);
  const endOfCurrentSummerSeason = parseISO(`${currentYear}-09-30`);
  const dateToCheck = parseISO(dateString);

  // now we have all of our dates, we can compare them
  return (
    compareDesc(startOfCurrentSummerSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentSummerSeason, dateToCheck) !== -1
  );
}

function isWindchillSeason(month) {
  // remember that months are 0 indexed
  const date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is november or greater, and april or less, its windchill season
  return month >= 11 || month <= 4;
}

function isSunSpotSeason(month) {
  const date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is feb/march then its sunspot season
  return month >= 2 && month < 4;
}

function getShorthandMonthNamesForSeason(stopAtCurrentMonth) {
  let months = ["apr", "may", "jun", "jul", "aug", "sep"];
  if (isWinterSeason()) months = ["oct", "nov", "dec", "jan", "feb"];

  if (stopAtCurrentMonth) {
    const currMonth = format(Date.now(), "MMM").toLowerCase();
    const currMonthIx = months.indexOf(currMonth);
    if (currMonthIx !== -1) months.splice(currMonthIx + 1, months.length - 1);
  }

  return months;
}

function isStartOfMonth() {
  const date = new Date();
  return date.getDate() <= 5;
}

function convertECCDateStringToDateObject(eccDateString) {
  const cleanTextSummary = eccDateString.replace(" at", "").replace(",", "");
  return new Date(cleanTextSummary);
}

function getDayOfYearAdjustedForLeapDay() {
  // returns the current day of the year (1-366) and if its a leap year will offset by 1 so that Dec 31st will always be day 366
  const isLeapYear = getDaysInYear(Date.now()) === 366;
  const dayOfYear = getDayOfYear(Date.now());
  const month = new Date().getMonth() + 1;

  // adjust by a day of its not a leap year and we're past feb
  return dayOfYear + (!isLeapYear && month > 2 ? 1 : 0);
}

getDayOfYearAdjustedForLeapDay();

module.exports = {
  isWinterSeason,
  isDateInWinterSeason,
  isDateInCurrentWinterSeason,
  isDateInCurrentSummerSeason,
  isWindchillSeason,
  isSunSpotSeason,
  getShorthandMonthNamesForSeason,
  isStartOfMonth,
  convertECCDateStringToDateObject,
  getDayOfYearAdjustedForLeapDay,
};
