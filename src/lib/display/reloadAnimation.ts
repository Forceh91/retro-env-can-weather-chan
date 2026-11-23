import { DISPLAY_MAX_CHARACTERS_PER_LINE, RELOAD_CLEAR_SCREEN_FRAMES, RELOAD_FRAME_MS } from "consts";

/**
 * Which part of the screen a row belongs to, because the two halves were chunked up differently by the original:
 * the observed conditions are a steady stream of 8 character bursts, the forecast is sent in a fixed set of columns.
 */
export type TypedRowKind = "conditions" | "forecast";

export type TypedRowStep = {
  /** how many characters of the row can be seen once this burst has arrived */
  chars: number;
  /** how long after the screen was cleared the burst arrives */
  atSeconds: number;
};

/** most bursts any one row can take (the conditions rows share their first one with the row above) */
export const TYPED_ROW_MAX_STEPS = 5;

// bursts come through in pairs, 1 frame apart, with a gap before the next pair. the gap started at 3 frames and then
// settled at 4 for the rest of the screen: pairs landed on frames 0, 3, 6, 9, 13, 17, 21, 25, 29, 33 ... (after the
// first burst)
const getBurstFrame = (burst: number) => {
  const pair = Math.floor(burst / 2);
  return (pair < 3 ? pair * 3 : pair * 4 - 3) + (burst % 2);
};

const BURSTS_PER_ROW = 4;

// the observed conditions: one continuous stream of 8 characters per burst, and the first burst had 9 in it. a row is
// 32 characters whether or not it's full so the stream rolls over into the next row, which is why a burst can finish
// one row off and start the next with a single character
const CONDITIONS_FIRST_BURST_CHARS = 9;
const CONDITIONS_BURST_CHARS = 8;
const getConditionsColumns = (row: number, burst: number) =>
  CONDITIONS_FIRST_BURST_CHARS + CONDITIONS_BURST_CHARS * burst - row * DISPLAY_MAX_CHARACTERS_PER_LINE;

// the forecast: every row has 4 bursts that end at the same columns. every other row skips the first of them (the
// recording only ever shows it on the 1st and 3rd rows of the forecast)
const FORECAST_COLUMNS = [4, 16, 20, DISPLAY_MAX_CHARACTERS_PER_LINE];
const FORECAST_COLUMNS_SKIPPING_FIRST = [0, ...FORECAST_COLUMNS.slice(1)];

const frameToSeconds = (frame: number) => ((RELOAD_CLEAR_SCREEN_FRAMES + frame) * RELOAD_FRAME_MS) / 1000;

/**
 * Works out when each burst of data for a row arrives, and how much of the row is showing after it. The screen is
 * blank for RELOAD_CLEAR_SCREEN_FRAMES first. Every row has its place in the transmission (rows come in the order they
 * are on screen) so a short row just finishes in an earlier burst, and the rows after it still turn up when they would
 * have anyway. A forecast with fewer lines is done sooner as there are less rows to send. Rows with nothing on them
 * don't have any steps.
 */
export function getTypedRowSteps(rows: { chars: number; kind: TypedRowKind }[]): TypedRowStep[][] {
  let firstForecastRow = rows.findIndex(({ kind }) => kind === "forecast");
  if (firstForecastRow < 0) firstForecastRow = rows.length;

  return rows.map(({ chars, kind }, row) => {
    const length = Math.min(chars, DISPLAY_MAX_CHARACTERS_PER_LINE);
    if (length < 1) return [];

    const steps: TypedRowStep[] = [];
    const reveal = (burst: number, columns: number) => {
      const visible = Math.min(Math.max(columns, 0), length);
      if (visible <= (steps[steps.length - 1]?.chars ?? 0)) return;
      steps.push({
        chars: visible,
        atSeconds: frameToSeconds(getBurstFrame(burst)),
      });
    };

    const firstBurst = row * BURSTS_PER_ROW;
    if (kind === "conditions") {
      // from the burst before this row's first one to the last one that could have any of it in
      for (let burst = Math.max(0, firstBurst - 1); burst <= firstBurst + BURSTS_PER_ROW; burst++) {
        reveal(burst, getConditionsColumns(row, burst));
        if (steps[steps.length - 1]?.chars === length) break;
      }
    } else {
      const columns = (row - firstForecastRow) % 2 ? FORECAST_COLUMNS_SKIPPING_FIRST : FORECAST_COLUMNS;
      columns.forEach((column, ix) => reveal(firstBurst + ix, column));
    }

    return steps;
  });
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Looks at the rows (elements with the "grid-row" class) inside of the screen and gives each of them the css variables
 * the typing animation in forecast.scss uses: how much of the row is showing (--type-w0, --type-w1, ...) after each
 * burst and when it arrives (--type-t0, --type-t1, ...). Rows are measured from what is actually on them, so it doesn't
 * matter how they were put together. Rows inside of ".forecast" are the forecast and everything else is conditions.
 */
export function applyTypedRowTimings(screen: HTMLElement | null) {
  if (!screen) return;

  const rows = Array.from(screen.querySelectorAll<HTMLElement>(".grid-row"));
  const steps = getTypedRowSteps(
    rows.map((row) => ({
      chars: (row.textContent ?? "").replace(/\u00a0/g, " ").replace(/\s+$/, "").length,
      kind: row.closest(".forecast") ? "forecast" : "conditions",
    }))
  );

  steps.forEach((rowSteps, ix) => {
    const { style } = rows[ix];

    for (let step = 0; step < TYPED_ROW_MAX_STEPS; step++) {
      // a row that needs less bursts than the css has room for just carries on with its last one
      const burst = rowSteps[Math.min(step, rowSteps.length - 1)];
      if (!burst) {
        style.removeProperty(`--type-w${step}`);
        style.removeProperty(`--type-t${step}`);
        continue;
      }

      style.setProperty(`--type-w${step}`, String(burst.chars));
      style.setProperty(`--type-t${step}`, `${round(burst.atSeconds)}s`);
    }
  });
}
