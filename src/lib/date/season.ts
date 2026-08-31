import { compareAsc, compareDesc, parseISO } from "date-fns";

export function getIsWinterSeason(month?: number) {
  const date: Date = new Date();
  if (month === undefined) {
    // Day-aware when using the clock (#854): winter precip UI is Oct 2 → Apr 1 inclusive.
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return m > 10 || (m === 10 && d >= 2) || m < 4 || (m === 4 && d <= 1);
  }

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
 * @param asOf Reference “today” for which winter season window to use (defaults to runtime clock). Pass observed station date when aggregating climate bulk data.
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

/**
 * Summer liquid precip window: **Apr 2 → Oct 1** inclusive in `asOf`’s calendar year (#854).
 * Outside that calendar window (e.g. mid-winter), returns false so winter aggregation is used instead.
 * @param asOf Reference date for which calendar year’s summer window to use (defaults to runtime clock).
 */
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
