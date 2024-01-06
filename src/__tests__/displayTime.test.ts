import { addDays, addMinutes, subDays } from "date-fns";
import {
  formatDisplayDate,
  adjustObservedDateTimeToStationTime,
  formatObservedLong,
  formatObservedMonthDate,
  formatSunspotDate,
  getDaysAheadFromObserved,
  getDaysBehindFromObserved,
} from "lib/date/displayTime";
import { WeatherStationTimeData } from "types/condition.types";

const date = new Date(2023, 7, 13, 13, 0, 0);
const dateTimeAtStation: WeatherStationTimeData = {
  observedDateTime: date.toISOString(),
  stationOffsetMinutesFromLocal: 0,
  timezone: "EDT",
};

describe("Formatted display time", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(date);
  });
  afterEach(() => jest.useRealTimers());

  it("adjusts the date/time according to where the station is", () => {
    expect(adjustObservedDateTimeToStationTime(dateTimeAtStation)).toStrictEqual(date);
    expect(
      adjustObservedDateTimeToStationTime({ ...dateTimeAtStation, stationOffsetMinutesFromLocal: 60 })
    ).toStrictEqual(addMinutes(date, 60));
    expect(
      adjustObservedDateTimeToStationTime({ ...dateTimeAtStation, stationOffsetMinutesFromLocal: -60 })
    ).toStrictEqual(addMinutes(date, -60));
  });

  it("formats the date in the bottom bar correctly", () => {
    expect(formatDisplayDate(date.getTime())).toStrictEqual(`Sun  Aug  13`);

    const tuesdayDate = new Date(2023, 7, 15).getTime();
    expect(formatDisplayDate(tuesdayDate)).toStrictEqual("tues Aug  15");

    const thursdayDate = new Date(2023, 7, 17).getTime();
    expect(formatDisplayDate(thursdayDate)).toStrictEqual("thur Aug  17");

    const juneDate = new Date(2023, 5, 5).getTime();
    expect(formatDisplayDate(juneDate)).toStrictEqual("Mon  june  5");

    const julyDate = new Date(2023, 6, 5).getTime();
    expect(formatDisplayDate(julyDate)).toStrictEqual("Wed  july  5");

    const septDate = new Date(2023, 8, 5).getTime();
    expect(formatDisplayDate(septDate)).toStrictEqual("tues sept  5");
  });

  it("formats the observed date/time for the conditions screen", () => {
    expect(formatObservedLong(dateTimeAtStation)).toStrictEqual(`1 PM EDT  Aug 13/23`);
    expect(formatObservedLong({ ...dateTimeAtStation, stationOffsetMinutesFromLocal: -60 }, true)).toStrictEqual(
      `Noon      Aug 13/23`
    );

    expect(
      formatObservedLong({ ...dateTimeAtStation, observedDateTime: new Date(2023, 7, 13, 0, 0).toISOString() }, true)
    ).toStrictEqual(`Midnight  Aug 13/23`);

    const extraPadding = "".padEnd(3);
    expect(formatObservedLong(dateTimeAtStation, true, extraPadding)).toStrictEqual(
      `1 PM EDT${extraPadding}  Aug 13/23`
    );
  });

  it("formats short month + date together correctly", () => {
    expect(formatObservedMonthDate(dateTimeAtStation)).toBe("Aug 13");
  });

  it("formats the sunspot dates correctly", () => {
    // aug 14th because its after 12pm
    expect(formatSunspotDate(dateTimeAtStation)).toStrictEqual("Aug. 14");

    // 13th because its before
    expect(
      formatSunspotDate({ ...dateTimeAtStation, observedDateTime: new Date(2023, 7, 13, 11).toISOString() })
    ).toStrictEqual("Aug. 13");

    // march+april gets full month name
    expect(
      formatSunspotDate({ ...dateTimeAtStation, observedDateTime: new Date(2023, 2, 5, 11).toISOString() })
    ).toStrictEqual("March 5");
    expect(
      formatSunspotDate({ ...dateTimeAtStation, observedDateTime: new Date(2023, 3, 16, 11).toISOString() })
    ).toStrictEqual("April 16");
  });

  it("gets days ahead from observed correctly", () => {
    expect(getDaysAheadFromObserved(dateTimeAtStation, 3)).toStrictEqual(addDays(date, 3));
    expect(getDaysAheadFromObserved(dateTimeAtStation)).toStrictEqual(addDays(date, 6));
  });

  it("gets days behind from observed correctly", () => {
    expect(getDaysBehindFromObserved(dateTimeAtStation, 4)).toStrictEqual(subDays(date, 4));
    expect(getDaysBehindFromObserved(dateTimeAtStation)).toStrictEqual(subDays(date, 1));
  });
});
