import { useEffect, useMemo, useRef, useState } from "react";
import { AQHIObservationResponse, CAPObject, WeatherStation } from "types";
import { AutomaticScreenProps } from "types/screen.types";
import { Conditions } from "../weather";
import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { formatStringTo8x32 } from "lib/display";
import { shouldAlertFlash } from "lib/cap-cp";

type ForecastScreenProps = {
  weatherStationResponse: WeatherStation;
  alert?: CAPObject;
  isReload?: boolean;
  airQuality: AQHIObservationResponse;
} & AutomaticScreenProps;

const MAX_FORECAST_PAGES = 2;

export function ForecastScreen(props: ForecastScreenProps) {
  const { onComplete, weatherStationResponse, alert, isReload, airQuality } = props ?? {};
  const [page, setPage] = useState(1);
  const pageChangeTimeout = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // handle page change as normal
    pageChangeTimeout.current = setTimeout(() => {
      if (page < MAX_FORECAST_PAGES) setPage(page + 1);
      else onComplete();
    }, (page === 1 && isReload ? 50 : SCREEN_DEFAULT_DISPLAY_LENGTH) * 1000);
  }, [page]);

  useEffect(() => {
    // if we're past the first page of forecast
    if (page === 1) return;

    // when a reload occurs, then clear the timeout for page change
    pageChangeTimeout.current && clearTimeout(pageChangeTimeout.current);

    // and send the user back to the first page
    setPage(1);
  }, [weatherStationResponse?.observationID]);

  // used to clear the page switching timeout
  useEffect(() => {
    return () => {
      pageChangeTimeout.current && clearTimeout(pageChangeTimeout.current);
    };
  }, []);

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

  const formatAlertHeadline = (headline: string) => {
    const truncated = headline
      ?.replace(/severe thunderstorm/gi, "severe tstorm")
      .replace(/statement/gi, "stmnt")
      .replace(/air quality/gi, "air qlty");
    return truncated;
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
  }, [weatherStationResponse?.stationTime?.observedDateTime, page]);

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
    <div id="forecast_screen" className={isReload ? "has-reloaded" : ""}>
      {page === 1 && (
        <>
          <Conditions
            city={weatherStationResponse.city}
            conditions={weatherStationResponse.observed}
            stationTime={weatherStationResponse.stationTime}
            airQuality={airQuality}
          />
          <div className="forecast reload-animation step-7">
            {alert && (
              <div className={`centre-align forecast-alert ${shouldAlertFlash(alert) ? "flash" : ""}`}>
                {formatAlertHeadline(alert.headline)}
              </div>
            )}
            <div>{formattedImmediateForecast}</div>
          </div>
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
