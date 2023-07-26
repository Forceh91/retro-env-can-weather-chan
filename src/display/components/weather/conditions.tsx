import { formatObservedLong } from "lib/date";
import { useMemo } from "react";
import { ObservedConditions, WeatherStationTimeData } from "types";

type ConditionsProp = {
  city: string;
  conditions: ObservedConditions;
  stationTime: WeatherStationTimeData;
  showPressure?: boolean;
};

export function Conditions(props: ConditionsProp) {
  const { city, conditions, stationTime, showPressure = false } = props ?? {};

  const title = useMemo(
    () => stationTime && `${city.padEnd(8).slice(0, 8)} ${formatObservedLong(stationTime, true)}`,
    [stationTime]
  );
  return <>{title}</>;
}
