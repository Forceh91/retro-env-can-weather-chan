import {
  MAX_CONDITION_LENGTH,
  MAX_NATIONAL_STATION_NAME_LENGTH,
  MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY,
} from "consts";
import { formatObservedLong } from "lib/date";
import { useEffect, useMemo, useState } from "react";
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

  const [observationsOnMount, setObservationsOnMount] = useState<NationalStationObservations>();

  // this stops the observations changing whilst the screen is being displayed
  useEffect(() => {
    if (
      !observations ||
      observations.length < MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY ||
      !weatherStationTime?.observedDateTime
    )
      return onComplete();

    if (!observationsOnMount?.length) setObservationsOnMount(observations);
  }, [observations]);

  if (!observationsOnMount || !weatherStationTime?.observedDateTime) return <></>;

  return (
    <div id="national_weather">
      <>
        {"".padStart(6)}
        {title}
      </>
      <ol>
        {observationsOnMount.map((nationalObservation) => (
          <li key={nationalObservation.code}>
            <span>{nationalObservation.name.padEnd(MAX_NATIONAL_STATION_NAME_LENGTH)}</span>
            <span>{Math.round(nationalObservation.temperature).toString().padStart(4)}</span>
            <span>
              {"".padStart(2)}
              {nationalObservation.abbreviatedCondition.padEnd(MAX_CONDITION_LENGTH)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
