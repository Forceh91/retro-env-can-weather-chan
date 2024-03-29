import { DISPLAY_MAX_CHARACTERS_PER_LINE } from "./display.consts";

const FORECAST_PREFIX_MAX_LENGTH = 22;
const FORECAST_TWO_LINE_MAX_LENGTH = DISPLAY_MAX_CHARACTERS_PER_LINE * 2;
const FORECAST_THREE_LINE_MAX_LENGTH = DISPLAY_MAX_CHARACTERS_PER_LINE * 3;
const FORECAST_FOUR_LINE_MAX_LENGTH = DISPLAY_MAX_CHARACTERS_PER_LINE * 4;

export const FORECAST_THREE_ISH_LINES_WITH_PREFIX_MAX_LENGTH =
  DISPLAY_MAX_CHARACTERS_PER_LINE * 3.3 - FORECAST_PREFIX_MAX_LENGTH;
export const FORECAST_THREE_LINE_WITH_PREFIX_MAX_LENGTH = FORECAST_THREE_LINE_MAX_LENGTH - FORECAST_PREFIX_MAX_LENGTH;
export const FORECAST_FOUR_LINE_WITH_PREFIX_MAX_LENGTH = FORECAST_FOUR_LINE_MAX_LENGTH - FORECAST_PREFIX_MAX_LENGTH;
export const FORECAST_TWO_LINE_WITH_PREFIX_MAX_LENGTH = FORECAST_TWO_LINE_MAX_LENGTH - FORECAST_PREFIX_MAX_LENGTH;
