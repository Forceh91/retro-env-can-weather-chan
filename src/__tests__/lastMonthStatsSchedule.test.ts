import { addMinutes, parseISO } from "date-fns";
import { Screens } from "consts";
import {
  filterFlavourScreensForPlayout,
  shouldIncludeLastMonthStatsInPlayout,
  stationWallClockFromStationTime,
} from "lib/flavour/lastMonthStatsSchedule";
import type { FlavourScreen } from "types";

describe("stationWallClockFromStationTime", () => {
  it("matches observedDateTimeAtStation (parse ISO + station offset minutes)", () => {
    const st = {
      observedDateTime: "2026-04-08T12:00:00.000Z",
      stationOffsetMinutesFromLocal: -300,
      timezone: "CDT",
    };
    const local = stationWallClockFromStationTime(st);
    expect(local).toEqual(addMinutes(parseISO(st.observedDateTime), st.stationOffsetMinutesFromLocal));
  });
});

describe("shouldIncludeLastMonthStatsInPlayout", () => {
  const row = (over: Partial<FlavourScreen> = {}): FlavourScreen => ({
    id: Screens.LAST_MONTH_STATS,
    duration: 12,
    ...over,
  });

  it("includes last month on authentic window days (calendar days 1–5)", () => {
    const d = new Date(Date.UTC(2026, 3, 3, 12, 0, 0));
    expect(shouldIncludeLastMonthStatsInPlayout(row(), d)).toBe(true);
    const edge = new Date(Date.UTC(2026, 3, 5, 23, 0, 0));
    expect(shouldIncludeLastMonthStatsInPlayout(row(), edge)).toBe(true);
  });

  it("omits last month after day 5 when the flavour flag is off", () => {
    const d = new Date(Date.UTC(2026, 3, 6, 12, 0, 0));
    expect(shouldIncludeLastMonthStatsInPlayout(row(), d)).toBe(false);
  });

  it("includes last month any day when lastMonthStatsShowAllMonth is true", () => {
    const d = new Date(Date.UTC(2026, 3, 20, 12, 0, 0));
    expect(shouldIncludeLastMonthStatsInPlayout(row({ lastMonthStatsShowAllMonth: true }), d)).toBe(true);
  });

  it("always includes non–last-month rows", () => {
    const d = new Date(Date.UTC(2026, 3, 20, 12, 0, 0));
    expect(shouldIncludeLastMonthStatsInPlayout({ id: Screens.FORECAST, duration: 10 }, d)).toBe(true);
  });

  it("includes last month when station time is unknown (do not blank the channel)", () => {
    expect(shouldIncludeLastMonthStatsInPlayout(row(), null)).toBe(true);
  });
});

describe("filterFlavourScreensForPlayout", () => {
  it("filters only last-month rows by station-local calendar day", () => {
    const screens: FlavourScreen[] = [
      { id: Screens.FORECAST, duration: 10 },
      { id: Screens.LAST_MONTH_STATS, duration: 12 },
    ];
    const stationTime = {
      observedDateTime: "2026-04-10T12:00:00.000Z",
      stationOffsetMinutesFromLocal: -300,
      timezone: "CDT",
    };
    const out = filterFlavourScreensForPlayout(screens, stationTime);
    expect(out.map((s) => s.id)).toEqual([Screens.FORECAST]);
  });
});
