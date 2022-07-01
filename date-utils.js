const { parseISO, compareAsc, compareDesc } = require("date-fns");

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
  const currentYear = date.getFullYear();
  const lastYear = date.getFullYear() - 1;

  // winter season is october 1st to march 31st
  const startOfCurrentWinterSeason = parseISO(`${lastYear}-09-01`);
  const endOfCurrentWinterSeason = parseISO(`${currentYear}-03-31`);
  const dateToCheck = parseISO(dateString);

  // now we have all of our dates, we can compare them
  return (
    compareDesc(startOfCurrentWinterSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentWinterSeason, dateToCheck) !== -1
  );
}

module.exports = { isWinterSeason, isDateInWinterSeason, isDateInCurrentWinterSeason };
