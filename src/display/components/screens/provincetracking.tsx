import { adjustObservedDateTimeToStationTime } from "lib/date";
import { formatProvinceYesterdayPrecipDisplay } from "lib/display/provinceYesterdayPrecipDisplay";
import { useEffect, useMemo } from "react";
import { ProvinceTracking, WeatherStationTimeData } from "types";
import { AutomaticScreenProps } from "types/screen.types";

// columns on the original (0 based): the station name starts on 0, the temperatures end on column 16, the "24-Hr Precip"
// heading and the precip amounts start on column 20 and the "Overnight"/"High" heading ends on column 17
const TEMPERATURE_END_COLUMN = 16;
const PRECIP_START_COLUMN = 20;
const HEADING_END_COLUMN = 17;
const STATION_NAME_LENGTH = 10;
const PRECIP_HEADING_GAP = PRECIP_START_COLUMN - HEADING_END_COLUMN;

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

  const formatTemp = (temp: number | string) => {
    if (typeof temp === "string") return temp;

    const tempNumber = Number(temp);
    return `${Math.round(tempNumber)}`;
  };

  return (
    <div id="province_tracking_screen">
      <div>
        {(isOvernight ? "Overnight" : "High").padStart(HEADING_END_COLUMN)}
        {"".padStart(PRECIP_HEADING_GAP)}
        24-Hr Precip
      </div>
      <div>
        {(isOvernight ? "Low:" : stationTime?.getHours() < 20 ? "Yesterday:" : "Today:").padStart(HEADING_END_COLUMN)}
        {"".padStart(PRECIP_HEADING_GAP)}
        for {yesterdayPrecipDate}
      </div>
      <ol>
        {stations.map((station) => (
          <li key={station.station.code}>
            <span>
              {station.station.name.slice(0, STATION_NAME_LENGTH).replace(/[-_/]/g, "").padEnd(STATION_NAME_LENGTH)}
            </span>
            <span>{formatTemp(station.displayTemp).padStart(TEMPERATURE_END_COLUMN - STATION_NAME_LENGTH)}</span>
            <span>{"".padEnd(PRECIP_START_COLUMN - TEMPERATURE_END_COLUMN)}</span>
            <span>{formatProvinceYesterdayPrecipDisplay(station.yesterdayPrecip, station.yesterdayPrecipUnit)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
