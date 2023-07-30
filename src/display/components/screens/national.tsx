import { MAX_NATIONAL_STATION_NAME_LENGTH, MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY } from "consts";
import { formatObservedLong } from "lib/date";
import { useEffect, useMemo } from "react";
import { NationalStationObservations, WeatherStationTimeData } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type NationalWeatherProps = {
  observations: NationalStationObservations;
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function NationalWeatherScreen(props: NationalWeatherProps) {
  const { observations, weatherStationTime, onComplete } = props ?? {};
  const title = useMemo(
    () => formatObservedLong(weatherStationTime, true, " "),
    [weatherStationTime?.observedDateTime]
  );

  useEffect(() => {
    if (
      !observations ||
      observations?.length < MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY ||
      !weatherStationTime?.observedDateTime
    )
      onComplete();
  }, []);

  if (!observations || !weatherStationTime?.observedDateTime) return <></>;

  return (
    <div id="national_weather">
      <>
        {"".padStart(6)}
        {title}
      </>
      <ol>
        {observations.map((nationalObservation) => (
          <li key={nationalObservation.code}>
            <span>{nationalObservation.name.padEnd(MAX_NATIONAL_STATION_NAME_LENGTH)}</span>
            <span>{Math.round(nationalObservation.temperature).toString().padStart(4)}</span>
            <span>&nbsp;&nbsp;{nationalObservation.abbreviatedCondition}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
