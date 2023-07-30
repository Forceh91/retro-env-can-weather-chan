import { format, isValid, parseISO, subDays } from "date-fns";
import { useEffect, useMemo } from "react";
import { ProvinceTracking, WeatherStationTimeData } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type ProvinceTrackingProps = {
  tracking: ProvinceTracking;
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function ProvinceTrackingScreen(props: ProvinceTrackingProps) {
  const { tracking, weatherStationTime, onComplete } = props ?? {};
  const { tracking: stations = null, isOvernight = true } = tracking ?? {};

  useEffect(() => {
    if (!stations?.length) onComplete();
  }, [tracking]);

  const dateString = useMemo(() => {
    const date = parseISO(weatherStationTime?.observedDateTime);
    if (!isValid(date)) return "";

    return format(subDays(date, 1), "MMM dd").replace(/\s0/i, "");
  }, [weatherStationTime?.observedDateTime]);

  if (!stations?.length) return <></>;

  const precipString = (precip: string | number) => {
    if (typeof precip === "string") return precip;

    const precipNumber = Number(precip);
    if (!precipNumber) return "NIL".padStart(5);

    return `${precipNumber.toFixed(1)} MM`.padStart(7);
  };

  return (
    <div id="province_tracking_screen">
      <div>
        {(isOvernight ? "Overnight" : "High").padStart(19)}
        {"".padStart(3)}
        24-Hr Precip
      </div>
      <div>
        {(isOvernight ? "Low:" : "Today:").padStart(19)}
        {"".padStart(4)}
        for {dateString}
      </div>
      <ol>
        {stations.map((station) => (
          <li key={station.station.code}>
            <span>{station.station.name.slice(0, 10).padEnd(10)}</span>
            <span>{station.displayTemp.toString().padStart(8)}</span>
            <span>{"".padEnd(7)}</span>
            <span>{precipString(station.yesterdayPrecip)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
