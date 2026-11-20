export const DISPLAY_MAX_CHARACTERS_PER_LINE = 32;
export const DISPLAY_MAX_LINES = 8;

/**
 * Data refresh animation (#998). The original hardware was fed over serial at 300bps, which is about 30 characters a
 * second, and the first page was updated "live" so you saw it arrive. It also cleared the screen before it started and
 * would sometimes stall for a moment between data points.
 */
export const RELOAD_CHARS_PER_SECOND = 80;
export const RELOAD_CLEAR_SCREEN_MS = 400;
export const RELOAD_ROW_PAUSE_MS = 10;
// add some jitter to the reload speed to simulate an actual network connection
// 0.4 means somewhere between 60% and 100% of RELOAD_CHARS_PER_SECOND
export const RELOAD_SPEED_JITTER = 0.4;
// how long the first page of the forecast stays up for when it's been typed out by a reload, before the next page
export const RELOAD_FIRST_PAGE_DISPLAY_LENGTH = 50;
