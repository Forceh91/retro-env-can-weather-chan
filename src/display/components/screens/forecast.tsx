import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { AQHIObservationResponse, CAPObject, WeatherStation } from "types";
import { AutomaticScreenProps } from "types/screen.types";
import { Conditions } from "../weather";
import { RELOAD_FIRST_PAGE_DISPLAY_LENGTH, SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { allocateForecastContinuationLines, applyTypedRowTimings, centreOnGrid, formatStringTo8x32 } from "lib/display";
import { forecastSignature } from "lib/refresh";
import { normalizeAlertHeadline, shouldAlertFlash } from "lib/cap-cp";

type ForecastScreenProps = {
  weatherStationResponse: WeatherStation;
  alert?: CAPObject;
  isReload?: boolean;
  /** changes whenever the channel refreshes; falls back to the observation ID */
  refreshID?: number | string;
  airQuality: AQHIObservationResponse;
  /** called once when the forecast moves past its first page, so the rotator can flip the background colour (#853) */
  onForecastContinuationEntered?: () => void;
} & AutomaticScreenProps;

const MAX_FORECAST_PAGES = 2;

export function ForecastScreen(props: ForecastScreenProps) {
  const { onComplete, weatherStationResponse, alert, isReload, refreshID, airQuality, onForecastContinuationEntered } =
    props ?? {};
  const [page, setPage] = useState(1);
  const continuationEnteredRef = useRef(false);
  const screenRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (page <= 1) {
      continuationEnteredRef.current = false;
      return;
    }
    if (continuationEnteredRef.current) return;
    continuationEnteredRef.current = true;
    onForecastContinuationEntered?.();
  }, [page, onForecastContinuationEntered]);

  useEffect(() => {
    // the first page stays up for longer when it's being typed out by a reload (#998)
    const pageLength = page === 1 && isReload ? RELOAD_FIRST_PAGE_DISPLAY_LENGTH : SCREEN_DEFAULT_DISPLAY_LENGTH;

    const pageChangeTimeout = setTimeout(() => {
      if (page < MAX_FORECAST_PAGES) setPage(page + 1);
      else onComplete();
    }, pageLength * 1000);

    // new conditions can arrive whilst this page is already showing. the rotator doesn't remount the screen for that, it
    // just flags the reload, so the timer has to start again for the reload instead of carrying on with the old one and
    // changing page part way through the animation. this also clears it when the page changes and when we're unmounted
    return () => clearTimeout(pageChangeTimeout);
  }, [page, isReload, refreshID ?? weatherStationResponse?.observationID]);

  useEffect(() => {
    // when a reload occurs and we're past the first page of forecast, send the user back to the first page (changing
    // page is what restarts the page change timer)
    if (page === 1) return;

    setPage(1);
  }, [refreshID ?? weatherStationResponse?.observationID]);

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
    const truncated = normalizeAlertHeadline(headline)
      .replace(/severe thunderstorm/gi, "severe tstorm")
      .replace(/statement/gi, "stmnt")
      .replace(/air quality/gi, "air qlty");
    return truncated;
  };

  // get all of the forecasts we'll need
  const [immediateForecast, page1Forecast1, page1Forecast2, page2Forecast1, page2Forecast2] =
    weatherStationResponse?.forecast ?? [];

  const forecastsForPage = getForecastsForPage();

  // the forecast text itself can change without a new observation, so key the formatting off the text
  const forecastKey = forecastSignature(weatherStationResponse?.forecast);

  // format immediate
  const formattedImmediateForecast = useMemo(() => {
    if (!weatherStationResponse?.forecast || page !== 1) return "";

    // by default we're allowed 4 lines for the forecast but if there's a warning/watch showing it'll be 3
    return formatStringTo8x32(
      `Forecast for ${immediateForecast.period}..${immediateForecast.abbreviatedTextSummary}`,
      alert ? 3 : 4
    );
  }, [forecastKey, page, !!alert]);

  // the upper 12 hour forecast can use up to 4 lines, the lower one up to 3, or the space is shared out by length
  const continuationLayout = useMemo(() => {
    if (page === 1) return null;

    const [upper, lower] = forecastsForPage;
    const upperText = upper ? `${upper.period}..${upper.abbreviatedTextSummary}` : "";
    const lowerText = lower ? `${lower.period}..${lower.abbreviatedTextSummary}` : "";
    const layout = allocateForecastContinuationLines(upperText, lowerText);

    return {
      ...layout,
      upper: formatStringTo8x32(upperText, layout.upperLines || 1),
      lower: formatStringTo8x32(lowerText, layout.lowerLines || 1),
    };
  }, [forecastKey, page]);

  // on a reload the first page arrives in bursts, a row at a time (#998), so each row needs to know when they happen
  useLayoutEffect(() => {
    if (isReload && page === 1) applyTypedRowTimings(screenRef.current);
  }, [isReload, page, refreshID ?? weatherStationResponse?.observationID, formattedImmediateForecast, alert?.headline]);

  // no response from weather station so whatever
  if (!weatherStationResponse) return <></>;

  return (
    <div id="forecast_screen" className={isReload ? "has-reloaded" : ""} ref={screenRef}>
      {page === 1 && (
        <>
          <Conditions
            city={weatherStationResponse.city}
            conditions={weatherStationResponse.observed}
            stationTime={weatherStationResponse.stationTime}
            airQuality={airQuality}
          />
          <div className="forecast">
            {alert && (
              <div className="grid-row">
                <div className={`forecast-alert ${shouldAlertFlash(alert) ? "flash" : ""}`}>
                  {centreOnGrid(formatAlertHeadline(alert.headline))}
                </div>
              </div>
            )}
            {formattedImmediateForecast.split("\n").map((line, ix) => (
              <div className="grid-row" key={ix}>
                {line}
              </div>
            ))}
          </div>
        </>
      )}
      {page > 1 && (
        <div>
          <div>{centreOnGrid(`${weatherStationResponse.city} forecast cont..`)}</div>
          <div>{continuationLayout?.upper}</div>
          {continuationLayout?.separator && <br />}
          <div>{continuationLayout?.lower}</div>
        </div>
      )}
    </div>
  );
}
