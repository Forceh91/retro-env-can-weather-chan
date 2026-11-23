import { DEFAULT_WEATHER_STATION_ID } from "consts";
import { format } from "date-fns";
import { getDaysAheadFromObserved } from "lib/date";
import { useMemo } from "react";
import { Forecast, OutlookForecast, WeatherStation } from "types";

// the original had one space on the condition line, under the second letter of the day (not 5)
const OUTLOOK_CONDITION_INDENT = 1;

type OutlookScreenProps = {
  weatherStationResponse: WeatherStation;
};

export function OutlookScreen(props: OutlookScreenProps) {
  const { weatherStationResponse } = props ?? {};
  const { stationID, city, forecast, stationTime, almanac } = weatherStationResponse ?? {};

  const title = useMemo(
    () => `Outlook for ${stationID === DEFAULT_WEATHER_STATION_ID ? "southern manitoba" : city}`,
    [stationID]
  );

  const outlook = useMemo(() => {
    if (!forecast?.length) return [];

    // the outlook screen shows 3 days of weather, starting 2 days from now
    const twoDaysAway = getDaysAheadFromObserved(stationTime, 2);
    const twoDaysAwayName = format(twoDaysAway, "EEEE");

    // we need to get day 3, 4, and 5 from the forecast. however we know that the forecast includes "night" forecasts too
    // first thing is to find the index in the forecast that is for threeDaysAway
    const startIx: number = forecast.findIndex((f: Forecast) => f.period === twoDaysAwayName.toLocaleLowerCase());
    if (startIx === -1) return;

    // now we can build up a forecast for each day
    const outlookForEachDay = [];
    for (let dayNum = 1, dayIx = startIx; dayNum <= 3; dayNum++) {
      const forecastDay = forecast[dayIx++];
      const forecastNight = forecast[dayIx++];

      outlookForEachDay.push({
        period: forecastDay?.period,
        high: forecastDay?.temperature?.value,
        low: forecastNight?.temperature?.value,
        condition: (forecastDay?.conditions?.split("or")[0] ?? "").trim(),
      });
    }

    return outlookForEachDay;
  }, [forecast]);

  if (!forecast?.length) return <>No outlook available</>;

  return (
    <>
      <div>&nbsp;{title}</div>
      <ol>
        {outlook?.length &&
          outlook.map((forecast: OutlookForecast, index) => (
            <li key={`outlook.${index}`}>
              {forecast.period}..Low {forecast.low}. High {forecast.high}.
              <br />
              {"".padStart(OUTLOOK_CONDITION_INDENT)}
              {forecast.condition}.
            </li>
          ))}
        <li>
          Normal Low {almanac?.temperatures?.normalMin?.value?.toFixed(0) ?? "N/A"}. High{" "}
          {almanac?.temperatures?.normalMax?.value?.toFixed(0) ?? "N/A"}.
        </li>
      </ol>
    </>
  );
}
