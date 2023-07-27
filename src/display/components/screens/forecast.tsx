import { useEffect, useMemo, useState } from "react";
import { WeatherStation } from "types";
import { AutomaticScreenProps } from "types/screen.types";
import { Conditions } from "../weather";
import { DISPLAY_MAX_CHARACTERS_PER_LINE, SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";

type ForecastScreenProps = {
  weatherStationResponse: WeatherStation;
};

const MAX_FORECAST_PAGES = 3;

export function ForecastScreen(props: ForecastScreenProps & AutomaticScreenProps) {
  const { onComplete, weatherStationResponse } = props ?? {};
  const [page, setPage] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      if (page < MAX_FORECAST_PAGES) setPage(page + 1);
      else onComplete();
    }, SCREEN_DEFAULT_DISPLAY_LENGTH * 1000);
  }, [page]);

  const formatForecast = (forecast: string, maxLines: number) => {
    // if the entire forecast is less than DISPLAY_MAX_CHARACTERS_PER_LINE, we can skip this
    if (forecast.length < DISPLAY_MAX_CHARACTERS_PER_LINE) return forecast;

    // we should follow the maxLinesx32 format here
    let formattedForecast = forecast;
    for (let line = 1, startPoint = 0; line <= maxLines; line++) {
      // before we do anything, we can just run to the end of the string if we'll past it
      if (startPoint + DISPLAY_MAX_CHARACTERS_PER_LINE >= forecast.length) {
        formattedForecast = `${formattedForecast.slice(0)}\n`;
        break;
      }

      // get the last space on this line and replace it with a line break
      const ixOfLastSpace = formattedForecast.lastIndexOf(" ", DISPLAY_MAX_CHARACTERS_PER_LINE * line);
      formattedForecast =
        formattedForecast.slice(0, ixOfLastSpace).trim() + "\n" + formattedForecast.slice(ixOfLastSpace).trim();

      startPoint += DISPLAY_MAX_CHARACTERS_PER_LINE;
    }

    // truncate the string at the last line break and do some trimming
    return formattedForecast.slice(0, formattedForecast.lastIndexOf("\n")).trim();
  };

  const getForecastsForPage = () => {
    // todo:make this much nicer
    switch (page) {
      case 1:
        return [immediateForecast];
      case 2:
        return [page1Forecast1, page1Forecast2];
      case 3:
        return [page2Forecast1, page2Forecast2];
    }
  };

  // get all of the forecasts we'll need
  const [immediateForecast, page1Forecast1, page1Forecast2, page2Forecast1, page2Forecast2] =
    weatherStationResponse?.forecast ?? [];

  const forecastsForPage = getForecastsForPage();

  // format immediate
  const formattedImmediateForecast = useMemo(() => {
    if (!weatherStationResponse?.forecast || page !== 1) return "";

    // by default we're allowed 4 lines for the forecast but if there's a warning/watch showing it'll be 3
    return formatForecast(`Forecast for ${immediateForecast.period}..${immediateForecast.abbreviatedTextSummary}`, 4);
  }, [weatherStationResponse?.stationTime?.observedDateTime]);

  // format the first forecast on the current page
  const formattedPageForecast1 = useMemo(() => {
    if (page === 1) return "";

    const forecast = forecastsForPage[0];
    return formatForecast(`${forecast.period}..${forecast.abbreviatedTextSummary}`, 3);
  }, [weatherStationResponse?.stationTime?.observedDateTime, page]);

  // format the second forecast on the current page
  const formattedPageForecast2 = useMemo(() => {
    if (page === 1) return "";

    const forecast = forecastsForPage[1];
    return formatForecast(`${forecast.period}..${forecast.abbreviatedTextSummary}`, 3);
  }, [weatherStationResponse?.stationTime?.observedDateTime, page]);

  // no response from weather station so whatever
  if (!weatherStationResponse) return <></>;

  return (
    <>
      {page === 1 && (
        <>
          <Conditions
            city={weatherStationResponse.city}
            conditions={weatherStationResponse.observed}
            stationTime={weatherStationResponse.stationTime}
          />
          <div className="forecast">{formattedImmediateForecast}</div>
        </>
      )}
      {page > 1 && (
        <div>
          <div>{weatherStationResponse.city} forecast cont..</div>
          <br />
          <div>{formattedPageForecast1}</div>
          <br />
          <div>{formattedPageForecast2}</div>
        </div>
      )}
    </>
  );
}
