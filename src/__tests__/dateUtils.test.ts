import { getDayOfYearAdjustedForLeapDay, isStartOfMonth } from "lib/date/utils";

const date = new Date(2023, 7, 13);

describe("Date utils", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => jest.useRealTimers());

  it("gets the day of the year correctly when leap years are taken into consideration", () => {
    // account for no leap year (after 28th feb)
    jest.setSystemTime(date);
    expect(getDayOfYearAdjustedForLeapDay()).toStrictEqual(226);

    // account for no leap year (before 29th feb)
    jest.setSystemTime(new Date(2023, 1, 22));
    expect(getDayOfYearAdjustedForLeapDay()).toStrictEqual(53);

    // account for leap year (before 29th feb)
    jest.setSystemTime(new Date(1996, 1, 22));
    expect(getDayOfYearAdjustedForLeapDay()).toStrictEqual(53);

    // account for leap year (after 29th feb)
    jest.setSystemTime(new Date(1996, 7, 13));
    expect(getDayOfYearAdjustedForLeapDay()).toStrictEqual(226);
  });

  it("detects its the start of the month", () => {
    jest.setSystemTime(new Date(2023, 7, 22));
    expect(isStartOfMonth()).toBeFalsy();

    jest.setSystemTime(new Date(2023, 7, 1));
    expect(isStartOfMonth()).toBeTruthy();

    expect(isStartOfMonth(new Date(2023, 5, 13))).toBeFalsy();
    expect(isStartOfMonth(new Date(2023, 5, 3))).toBeTruthy();
  });
});
