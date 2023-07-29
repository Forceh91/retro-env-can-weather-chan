import { useEffect, useMemo, useState } from "react";
import { CAPObject, WeatherStation } from "types";
import { AutomaticScreenProps } from "types/screen.types";
import { Conditions } from "../weather";
import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { formatStringTo8x32 } from "lib/display";
import { cleanupAlertHeadline, shouldAlertFlash } from "lib/cap-cp";

type ForecastScreenProps = {
  weatherStationResponse: WeatherStation;
  alert?: CAPObject;
} & AutomaticScreenProps;

const MAX_FORECAST_PAGES = 2;

export function ForecastScreen(props: ForecastScreenProps) {
  const { onComplete, weatherStationResponse, alert } = props ?? {};
  const [page, setPage] = useState(1);

  useEffect(() => {
    setTimeout(() => {
      if (page < MAX_FORECAST_PAGES) setPage(page + 1);
      else onComplete();
    }, SCREEN_DEFAULT_DISPLAY_LENGTH * 1000);
  }, [page]);

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
    return formatStringTo8x32(
      `Forecast for ${immediateForecast.period}..${immediateForecast.abbreviatedTextSummary}`,
      alert ? 3 : 4
    );
  }, [weatherStationResponse?.stationTime?.observedDateTime]);

  // format the first forecast on the current page
  const formattedPageForecast1 = useMemo(() => {
    if (page === 1) return "";

    const forecast = forecastsForPage[0];
    return formatStringTo8x32(`${forecast.period}..${forecast.abbreviatedTextSummary}`, 3);
  }, [weatherStationResponse?.stationTime?.observedDateTime, page]);

  // format the second forecast on the current page
  const formattedPageForecast2 = useMemo(() => {
    if (page === 1) return "";

    const forecast = forecastsForPage[1];
    return formatStringTo8x32(`${forecast.period}..${forecast.abbreviatedTextSummary}`, 3);
  }, [weatherStationResponse?.stationTime?.observedDateTime, page]);

  // no response from weather station so whatever
  if (!weatherStationResponse) return <></>;

  return (
    <div id="forecast_screen">
      {page === 1 && (
        <>
          <Conditions
            city={weatherStationResponse.city}
            conditions={weatherStationResponse.observed}
            stationTime={weatherStationResponse.stationTime}
          />
          {alert && (
            <div className={`centre-align forecast-alert ${shouldAlertFlash(alert) ? "flash" : ""}`}>
              {alert.headline}
            </div>
          )}
          <div className="forecast">{formattedImmediateForecast}</div>
        </>
      )}
      {page > 1 && (
        <div>
          <div className="centre-align">{weatherStationResponse.city} forecast cont..</div>
          <br />
          <div>{formattedPageForecast1}</div>
          <br />
          <div>{formattedPageForecast2}</div>
        </div>
      )}
    </div>
  );
}
