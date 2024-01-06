import { ecccDateStringToTSDate, getShorthandMonthNamesForSeason } from "lib/date/ecccDate";
import * as seasonsLib from "lib/date/season";
import { EDT_OFFSET_MINS_FROM_UTC, MockDateSetup, setupMockDate } from "lib/tests/timezone";

let mockDate: MockDateSetup;

describe("Helpers for ECCC dates", () => {
  beforeEach(() => {
    mockDate = setupMockDate();
    mockDate.set({ offset: EDT_OFFSET_MINS_FROM_UTC });
  });

  afterEach(() => {
    mockDate.reset();
    jest.useRealTimers();
  });

  it("parses to a date object correctly", () => {
    const ecccDateString = "Sunday August 13, 2023 at 12:00 EDT";
    const expectedDate = new Date(2023, 7, 13, 12, 0, 0);
    expect(ecccDateStringToTSDate(ecccDateString)).toStrictEqual(expectedDate);
  });

  it("gets the correct months for the current season", () => {
    jest.useFakeTimers();

    const summerMonths = ["apr", "may", "jun", "jul", "aug", "sep"];
    jest.spyOn(seasonsLib, "getIsWinterSeason").mockImplementation(() => false);
    expect(getShorthandMonthNamesForSeason(false)).toStrictEqual(summerMonths);

    jest.setSystemTime(new Date(2023, 7, 13));
    expect(getShorthandMonthNamesForSeason(true)).toStrictEqual(summerMonths.slice(0, 5));

    const winterMonths = ["oct", "nov", "dec", "jan", "feb", "mar"];
    jest.spyOn(seasonsLib, "getIsWinterSeason").mockImplementation(() => true);
    expect(getShorthandMonthNamesForSeason(false)).toStrictEqual(winterMonths);

    jest.setSystemTime(new Date(2023, 11, 13));
    expect(getShorthandMonthNamesForSeason(true)).toStrictEqual(winterMonths.slice(0, 3));
  });
});
