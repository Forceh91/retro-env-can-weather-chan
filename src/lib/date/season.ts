import { compareAsc, compareDesc, parseISO } from "date-fns";

export function getIsWinterSeason(month?: number) {
  // remember that months are 0 indexed
  const date: Date = new Date();
  if (month === undefined) month = date?.getMonth() + 1;

  // if the month is october or greater, and march or less, its winter season
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

/**
 * Winter precip season for bulk totals: **Oct 2 → Apr 1** (inclusive across the year boundary).
 * Summer begins **Apr 2**; winter begins **Oct 2** so the first calendar day of a new period is not all zeros (#854).
 */
export function isDateInCurrentWinterSeason(isoDate: string, asOf: Date = new Date()) {
  const dateToCheck = parseISO(isoDate);
  const currentMonth = asOf.getMonth() + 1;
  const currentDay = asOf.getDate();
  const currentYear = asOf.getFullYear();
  const lastYear = currentYear - 1;
  const nextYear = currentYear + 1;

  let startOfCurrentWinterSeason: Date;
  let endOfCurrentWinterSeason: Date;

  if (currentMonth > 10 || (currentMonth === 10 && currentDay >= 2)) {
    startOfCurrentWinterSeason = parseISO(`${currentYear}-10-02`);
    endOfCurrentWinterSeason = parseISO(`${nextYear}-04-01`);
  } else {
    /** Jan 1 – Oct 1: bulk totals still attribute to the Oct→Apr winter that ends Apr 1 this year (#854, tests). */
    startOfCurrentWinterSeason = parseISO(`${lastYear}-10-02`);
    endOfCurrentWinterSeason = parseISO(`${currentYear}-04-01`);
  }

  return (
    compareDesc(startOfCurrentWinterSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentWinterSeason, dateToCheck) !== -1
  );
}

/** Summer liquid precip window: **Apr 2 → Oct 1** inclusive in `asOf`’s calendar year (#854). */
export function isDateInCurrentSummerSeason(isoDate: string, asOf: Date = new Date()) {
  const dateToCheck = parseISO(isoDate);
  const currentYear = asOf.getFullYear();
  const currentMonth = asOf.getMonth() + 1;
  const currentDay = asOf.getDate();

  if (
    !(
      (currentMonth === 4 && currentDay >= 2) ||
      (currentMonth > 4 && currentMonth < 10) ||
      (currentMonth === 10 && currentDay <= 1)
    )
  ) {
    return false;
  }

  const startOfCurrentSummerSeason = parseISO(`${currentYear}-04-02`);
  const endOfCurrentSummerSeason = parseISO(`${currentYear}-10-01`);

  return (
    compareDesc(startOfCurrentSummerSeason, dateToCheck) !== -1 &&
    compareAsc(endOfCurrentSummerSeason, dateToCheck) !== -1
  );
}
