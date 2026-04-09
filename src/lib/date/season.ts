import { compareAsc, compareDesc, parseISO } from "date-fns";

export function getIsWinterSeason(month?: number) {
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  return month >= 10 || month <= 3;
}

export function isWindchillSeason(month?: number) {
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  return month >= 11 || month <= 4;
}

export function isSunSpotSeason(month?: number) {
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  return month >= 2 && month < 4;
}

export function isDateInWinterSeason(isoDate: string) {
  const date = parseISO(isoDate);
  return getIsWinterSeason(date.getMonth() + 1);
}

/** @param asOf Reference “today” for which winter season window to use (defaults to runtime clock). Pass observed station date when aggregating climate bulk data. */
export function isDateInCurrentWinterSeason(isoDate: string, asOf: Date = new Date()) {
  const currentMonth = asOf.getMonth() + 1;
  const currentYear = asOf.getFullYear();
  const lastYear = asOf.getFullYear() - 1;
  const nextYear = asOf.getFullYear() + 1;

  let startOfCurrentWinterSeason = null;
  let endOfCurrentWinterSeason = null;

  if (currentMonth >= 10) {
    startOfCurrentWinterSeason = parseISO(`${currentYear}-10-01`);
    endOfCurrentWinterSeason = parseISO(`${nextYear}-03-31`);
  } else {
    startOfCurrentWinterSeason = parseISO(`${lastYear}-10-01`);
    endOfCurrentWinterSeason = parseISO(`${currentYear}-03-31`);
  }

  const dateToCheck = parseISO(isoDate);

  return (
    compareDesc(startOfCurrentWinterSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentWinterSeason, dateToCheck) !== -1
  );
}

/** @param asOf Reference date for which calendar year’s Apr–Sep window to use (defaults to runtime clock). */
export function isDateInCurrentSummerSeason(isoDate: string, asOf: Date = new Date()) {
  const currentYear = asOf.getFullYear();

  const startOfCurrentSummerSeason = parseISO(`${currentYear}-04-01`);
  const endOfCurrentSummerSeason = parseISO(`${currentYear}-09-30`);
  const dateToCheck = parseISO(isoDate);

  return (
    compareDesc(startOfCurrentSummerSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentSummerSeason, dateToCheck) !== -1
  );
}
