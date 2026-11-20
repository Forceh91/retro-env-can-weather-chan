import {
  RELOAD_CHARS_PER_SECOND,
  RELOAD_CLEAR_SCREEN_MS,
  RELOAD_ROW_PAUSE_MS,
  RELOAD_SPEED_JITTER,
} from "consts";

export type TypedRowTiming = {
  chars: number;
  delaySeconds: number;
  durationSeconds: number;
};

export type TypedRowOptions = {
  charsPerSecond?: number;
  clearScreenMs?: number;
  rowPauseMs?: number;
  /** how much slower than `charsPerSecond` a row can be, 0.4 = anywhere from 60% to 100% of the speed */
  speedJitter?: number;
  /** 0 <= n < 1, only here so it can be made predictable */
  random?: () => number;
};

/**
 * Works out when each row of the screen starts being typed, and how long it takes, so the characters turn up one after
 * another like they came in over the serial line on the original hardware. The screen is blank for `clearScreenMs`
 * first and there's a short pause between each row. The line never ran at full speed all of the time so every row gets
 * its own speed, somewhere below `charsPerSecond`. Empty rows don't take any time (returns null).
 */
export function getTypedRowTimings(
  rowLengths: number[],
  {
    charsPerSecond = RELOAD_CHARS_PER_SECOND,
    clearScreenMs = RELOAD_CLEAR_SCREEN_MS,
    rowPauseMs = RELOAD_ROW_PAUSE_MS,
    speedJitter = RELOAD_SPEED_JITTER,
    random = Math.random,
  }: TypedRowOptions = {}
): (TypedRowTiming | null)[] {
  let startSeconds = clearScreenMs / 1000;

  return rowLengths.map((chars) => {
    if (!chars || chars < 1) return null;

    const rowCharsPerSecond = charsPerSecond * (1 - speedJitter * random());
    const timing = { chars, delaySeconds: startSeconds, durationSeconds: chars / rowCharsPerSecond };
    startSeconds += timing.durationSeconds + rowPauseMs / 1000;
    return timing;
  });
}

// small seeded random number generator (mulberry32) so the same data always types in the same way. if it was
// Math.random() then anything re-running while it was typing would change the speed halfway through a row
export function seededRandom(seed: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(hash ^ seed.charCodeAt(i), 16777619);

  let state = hash >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Looks at the rows (elements with the "grid-row" class) inside of the screen and gives each of them the css variables
 * the typing animation in forecast.scss uses. Rows are measured from what is actually on them, so it doesn't matter how
 * they were put together. The seed (the observation) decides how the speed varies, so a new observation types in
 * differently but the same one always does the same thing.
 */
export function applyTypedRowTimings(screen: HTMLElement | null, seed: string = "") {
  if (!screen) return;

  const rows = Array.from(screen.querySelectorAll<HTMLElement>(".grid-row"));
  const lengths = rows.map((row) => (row.textContent ?? "").replace(/\u00a0/g, " ").replace(/\s+$/, "").length);

  getTypedRowTimings(lengths, { random: seededRandom(seed) }).forEach((timing, ix) => {
    const { style } = rows[ix];
    if (!timing) return style.removeProperty("--type-chars");

    style.setProperty("--type-chars", String(timing.chars));
    style.setProperty("--type-delay", `${round(timing.delaySeconds)}s`);
    style.setProperty("--type-duration", `${round(timing.durationSeconds)}s`);
  });
}
