export const DISPLAY_MAX_CHARACTERS_PER_LINE = 32;
export const DISPLAY_MAX_LINES = 8;

/**
 * Data refresh animation (#998). Timings were measured frame by frame from a recording of the original hardware
 * (29.97fps): the screen sits blank for 26 frames and then the data turns up in short bursts rather than one character
 * at a time, so all of these are in frames and not in characters a second.
 */
export const RELOAD_FRAME_MS = 1001 / 30;
// how many frames the screen is blank for before the first burst of data arrives
export const RELOAD_CLEAR_SCREEN_FRAMES = 26;
// how long the first page of the forecast stays up for when it's been typed out by a reload, before the next page
export const RELOAD_FIRST_PAGE_DISPLAY_LENGTH = 50;
