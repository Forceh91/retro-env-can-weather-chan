import { RELOAD_CHARS_PER_SECOND, RELOAD_CLEAR_SCREEN_MS, RELOAD_ROW_PAUSE_MS } from "consts";

export type TypedRowTiming = {
  chars: number;
  delaySeconds: number;
  durationSeconds: number;
};

/**
 * Works out when each row of the screen starts being typed, and how long it takes, so the characters turn up one after
 * another at `charsPerSecond` like they came in over the serial line on the original hardware. The screen is blank for
 * `clearScreenMs` first and there's a short pause between each row. Empty rows don't take any time (returns null).
 */
export function getTypedRowTimings(
  rowLengths: number[],
  charsPerSecond: number = RELOAD_CHARS_PER_SECOND,
  clearScreenMs: number = RELOAD_CLEAR_SCREEN_MS,
  rowPauseMs: number = RELOAD_ROW_PAUSE_MS
): (TypedRowTiming | null)[] {
  let startSeconds = clearScreenMs / 1000;

  return rowLengths.map((chars) => {
    if (!chars || chars < 1) return null;

    const timing = { chars, delaySeconds: startSeconds, durationSeconds: chars / charsPerSecond };
    startSeconds += timing.durationSeconds + rowPauseMs / 1000;
    return timing;
  });
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Looks at the rows (elements with the "grid-row" class) inside of the screen and gives each of them the css variables
 * the typing animation in forecast.scss uses. Rows are measured from what is actually on them, so it doesn't matter how
 * they were put together.
 */
export function applyTypedRowTimings(screen: HTMLElement | null) {
  if (!screen) return;

  const rows = Array.from(screen.querySelectorAll<HTMLElement>(".grid-row"));
  const lengths = rows.map((row) => (row.textContent ?? "").replace(/\u00a0/g, " ").replace(/\s+$/, "").length);

  getTypedRowTimings(lengths).forEach((timing, ix) => {
    const { style } = rows[ix];
    if (!timing) return style.removeProperty("--type-chars");

    style.setProperty("--type-chars", String(timing.chars));
    style.setProperty("--type-delay", `${round(timing.delaySeconds)}s`);
    style.setProperty("--type-duration", `${round(timing.durationSeconds)}s`);
  });
}
