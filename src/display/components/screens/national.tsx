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
  area: string; // unique identified since for when these screens are in a row and the component doesn't unrender
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function NationalWeatherScreen(props: NationalWeatherProps) {
  const { observations, area, weatherStationTime, onComplete } = props ?? {};
  const title = useMemo(
    () => formatObservedLong(weatherStationTime, true, " "),
    [weatherStationTime?.observedDateTime]
  );

  const [observationsOnMount, setObservationsOnMount] = useState<NationalStationObservations>();
  const [areaOnMount, setAreaOnMount] = useState("");

  // this stops the observations changing whilst the screen is being displayed
  useEffect(() => {
    if (
      !observations ||
      observations.length < MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY ||
      !weatherStationTime?.observedDateTime
    )
      return onComplete();

    if (area !== areaOnMount || !observationsOnMount?.length) setObservationsOnMount(observations);
    setAreaOnMount(area);
  }, [observations, area]);

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
