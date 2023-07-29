import { MAX_REGIONAL_STATION_NAME_LENGTH, MIN_REGIONAL_STATIONS_NEEDED_TO_DISPLAY } from "consts";
import { formatObservedLong } from "lib/date";
import { useEffect, useMemo } from "react";
import { RegionalStationObservations, WeatherStationTimeData } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type RegionalWeatherProps = {
  observations: RegionalStationObservations;
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function RegionalWeatherScreen(props: RegionalWeatherProps) {
  const { observations, weatherStationTime, onComplete } = props ?? {};
  const title = useMemo(
    () => formatObservedLong(weatherStationTime, true, " "),
    [weatherStationTime?.observedDateTime]
  );

  useEffect(() => {
    if (
      !observations ||
      observations?.length < MIN_REGIONAL_STATIONS_NEEDED_TO_DISPLAY ||
      !weatherStationTime?.observedDateTime
    )
      onComplete();
  }, []);

  if (!observations || !weatherStationTime?.observedDateTime) return <></>;

  return (
    <div id="regional_weather">
      <>
        {"".padStart(6)}
        {title}
      </>
      <ol>
        {observations.map((regionalObservation) => (
          <li key={regionalObservation.code}>
            <span>{regionalObservation.name.padEnd(MAX_REGIONAL_STATION_NAME_LENGTH)}</span>
            <span>{Math.round(regionalObservation.temperature).toString().padStart(4)}</span>
            <span>&nbsp;&nbsp;{regionalObservation.abbreviatedCondition}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
