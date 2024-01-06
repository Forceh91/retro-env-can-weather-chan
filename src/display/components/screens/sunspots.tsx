import { MAX_SUNSPOT_CITY_NAME_LENGTH } from "consts";
import { formatSunspotDate, isSunSpotSeason } from "lib/date";
import { useEffect, useMemo } from "react";
import { SunspotStationObservations, WeatherStationTimeData, AutomaticScreenProps } from "types";

type SunspotScreenProps = {
  sunspots: SunspotStationObservations;
  weatherStationTime: WeatherStationTimeData;
} & AutomaticScreenProps;

export function SunspotScreen(props: SunspotScreenProps) {
  const { sunspots, weatherStationTime, onComplete } = props ?? {};
  const screenShouldDisplay = isSunSpotSeason() && sunspots?.length;

  useEffect(() => {
    if (!screenShouldDisplay) onComplete();
  }, []);

  if (!screenShouldDisplay) return <></>;

  const sunspotDate = useMemo(
    () => weatherStationTime?.observedDateTime && formatSunspotDate(weatherStationTime).padEnd(9),
    [weatherStationTime?.observedDateTime]
  );

  const formatTemp = (temperature: number) =>
    Math.round(temperature ?? 0)
      .toString()
      .padStart(2, "0");

  return (
    <div id="sunspots_screen">
      <div>
        {sunspotDate}
        {"Sunspot Weather".padEnd(17)}
        Hi/Lo
      </div>
      <ol>
        {sunspots.map((sunspot) => (
          <li key={sunspot.code}>
            <span>{sunspot.name.slice(0, MAX_SUNSPOT_CITY_NAME_LENGTH).padEnd(MAX_SUNSPOT_CITY_NAME_LENGTH)}</span>
            <span>{sunspot.abbreviatedForecast.padEnd(13)}</span>
            <span>
              {formatTemp(sunspot.highTemp)}/{formatTemp(sunspot.lowTemp)}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
