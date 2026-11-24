import { FORECAST_CONTINUATION_MAX_LINES, FORECAST_CONTINUATION_SHARED_LINES } from "consts/forecast.consts";
import { formatStringTo8x32 } from "./formatter";

export type ForecastContinuationLayout = {
  upperLines: number;
  lowerLines: number;
  /** whether the blank line between the two forecasts is still showing */
  separator: boolean;
};

const wrappedLineCount = (text: string) =>
  text ? formatStringTo8x32(text, FORECAST_CONTINUATION_MAX_LINES).split("\n").length : 0;

/**
 * Splits the space on a "forecast cont.." page between the upper and lower 12 hour forecasts.
 * The upper forecast gets first pick (up to 4 lines), the lower one gets what's left of the shared lines
 * (so it's held to 3 lines when the upper one needs all 4). The blank line between them only stays if both fit
 * without it - otherwise that line is handed to the text.
 */
export function allocateForecastContinuationLines(upperText: string, lowerText: string): ForecastContinuationLayout {
  const upperLines = Math.min(wrappedLineCount(upperText), FORECAST_CONTINUATION_MAX_LINES);
  const lowerLines = Math.min(
    wrappedLineCount(lowerText),
    FORECAST_CONTINUATION_MAX_LINES,
    FORECAST_CONTINUATION_SHARED_LINES - upperLines
  );

  return { upperLines, lowerLines, separator: upperLines + lowerLines < FORECAST_CONTINUATION_SHARED_LINES };
}
