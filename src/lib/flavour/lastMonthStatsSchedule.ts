import { addMinutes, parseISO } from "date-fns";
import { Screens } from "consts";
import { isStartOfMonth } from "lib/date/utils";
import type { FlavourScreen } from "types";
import type { WeatherStationTimeData } from "types/condition.types";

export function stationWallClockFromStationTime(st?: WeatherStationTimeData): Date | null {
  if (!st?.observedDateTime) return null;
  const utc = parseISO(st.observedDateTime);
  if (Number.isNaN(utc.getTime())) return null;
  return addMinutes(utc, st.stationOffsetMinutesFromLocal ?? 0);
}

export function shouldIncludeLastMonthStatsInPlayout(screen: FlavourScreen, stationLocalNow: Date | null): boolean {
  if (screen.id !== Screens.LAST_MONTH_STATS) return true;
  if (screen.lastMonthStatsShowAllMonth === true) return true;
  if (!stationLocalNow) return true;
  return isStartOfMonth(stationLocalNow);
}

export function filterFlavourScreensForPlayout(
  screens?: FlavourScreen[],
  stationTime?: WeatherStationTimeData
): FlavourScreen[] {
  const list = screens ?? [];
  const local = stationWallClockFromStationTime(stationTime);
  return list.filter((s) => shouldIncludeLastMonthStatsInPlayout(s, local));
}
