import { adjustObservedDateTimeToStationTime } from "lib/date";
import { useEffect, useMemo } from "react";
import { ProvinceTracking, WeatherStationTimeData } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type ProvinceTrackingProps = {
  tracking: ProvinceTracking;
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function ProvinceTrackingScreen(props: ProvinceTrackingProps) {
  const { tracking, weatherStationTime, onComplete } = props ?? {};
  const { tracking: stations = null, isOvernight = true, yesterdayPrecipDate } = tracking ?? {};

  useEffect(() => {
    if (!stations?.length) onComplete();
  }, [tracking]);

  const stationTime = useMemo(() => {
    if (!weatherStationTime?.observedDateTime) return null;
    return adjustObservedDateTimeToStationTime(weatherStationTime);
  }, [yesterdayPrecipDate, weatherStationTime?.observedDateTime]);

  if (!stations?.length) return <></>;

  const precipString = (precip: string | number) => {
    if (typeof precip === "string") return precip;

    const precipNumber = Number(precip);
    if (!precipNumber) return "NIL".padStart(5);

    if (precipNumber < 0.2) return "TRACE";

    return `${precipNumber.toFixed(1)} MM`.padStart(7);
  };

  const formatTemp = (temp: number | string) => {
    if (typeof temp === "string") return temp;

    const tempNumber = Number(temp);
    return `${Math.round(tempNumber)}`;
  };

  return (
    <div id="province_tracking_screen">
      <div>
        {(isOvernight ? "Overnight" : "High").padStart(19)}
        {"".padStart(3)}
        24-Hr Precip
      </div>
      <div>
        {(isOvernight ? "Low:" : stationTime?.getHours() < 20 ? "Yesterday:" : "Today:").padStart(19)}
        {"".padStart(4)}
        for {yesterdayPrecipDate}
      </div>
      <ol>
        {stations.map((station) => (
          <li key={station.station.code}>
            <span>{station.station.name.slice(0, 10).padEnd(10)}</span>
            <span>{formatTemp(station.displayTemp).padStart(8)}</span>
            <span>{"".padEnd(7)}</span>
            <span>{precipString(station.yesterdayPrecip)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
