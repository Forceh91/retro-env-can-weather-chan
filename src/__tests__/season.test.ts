import {
  getIsWinterSeason,
  isDateInCurrentSummerSeason,
  isDateInCurrentWinterSeason,
  isDateInWinterSeason,
  isSunSpotSeason,
  isWindchillSeason,
} from "lib/date/season";

describe("seasons", () => {
  afterEach(() => jest.useRealTimers());

  it("getIsWinterSeason: detects is winter season correctly", () => {
    expect(getIsWinterSeason(4)).toBeFalsy();
    expect(getIsWinterSeason(2)).toBeTruthy();

    jest.useFakeTimers();
    jest.setSystemTime(new Date(2023, 7, 13));
    expect(getIsWinterSeason()).toBeFalsy();

    jest.setSystemTime(new Date(2023, 0, 13));
    expect(getIsWinterSeason()).toBeTruthy();
  });

  test("isWindchillSeason: calculates if its windchill season correctly or not", () => {
    const windchillMonths = [11, 12, 1, 2, 3, 4];
    const notWindchillMonths = [5, 6, 7, 8, 9, 10];

    windchillMonths.forEach((month) => expect(isWindchillSeason(month)).toBe(true));
    notWindchillMonths.forEach((month) => expect(isWindchillSeason(month)).toBe(false));
  });

  test("isSunSpotSeason: calculates if its sunspot season correctly or not", () => {
    const sunspotMonths = [2, 3];
    const notSunspotMonths = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    sunspotMonths.forEach((month) => expect(isSunSpotSeason(month)).toBe(true));
    notSunspotMonths.forEach((month) => expect(isSunSpotSeason(month)).toBe(false));
  });

  it("isDateInWinterSeason: detects a date is in winter season correctly", () => {
    expect(isDateInWinterSeason(new Date(2023, 0, 13).toISOString())).toBeTruthy();
    expect(isDateInWinterSeason(new Date(2023, 5, 13).toISOString())).toBeFalsy();
  });

  it("isDateInCurrentWinterSeason: makes sure the passed date is in the current winter season", () => {
    // e.g. 2023-01-02 would be, but 2023-11-15 would not be
    const thisWinterDate = new Date(2023, 1, 22);
    jest.setSystemTime(thisWinterDate);
    expect(isDateInCurrentWinterSeason(thisWinterDate.toISOString())).toBeTruthy();

    const nextWinterDate = new Date(2023, 10, 22);
    jest.setSystemTime(nextWinterDate);
    expect(isDateInCurrentWinterSeason(nextWinterDate.toISOString())).toBeFalsy();

    const notInWinterDate = new Date(2023, 5, 22);
    jest.setSystemTime(notInWinterDate);
    expect(isDateInCurrentWinterSeason(notInWinterDate.toISOString())).toBeFalsy();
  });

  it("isDateInCurrentSummerSeason: makes sure the passed date is in the current summer season", () => {
    // e.g. 2023-04-22 would be, but 2023-11-15 would not be
    const thisSummerDate = new Date(2023, 3, 22);
    jest.setSystemTime(thisSummerDate);
    expect(isDateInCurrentSummerSeason(thisSummerDate.toISOString())).toBeTruthy();

    const dateOutsideOfSummer = new Date(2023, 10, 22);
    jest.setSystemTime(dateOutsideOfSummer);
    expect(isDateInCurrentSummerSeason(dateOutsideOfSummer.toISOString())).toBeFalsy();
  });
});
