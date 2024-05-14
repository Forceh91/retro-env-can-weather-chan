export enum Screens {
  ALERTS,
  FORECAST,
  OUTLOOK,
  ALMANAC,
  AQHI_WARNING,
  PROVINCE_PRECIP,
  CANADA_TEMP_CONDITIONS_MB,
  CANADA_TEMP_CONDITIONS_WEST,
  CANADA_TEMP_CONDITIONS_EAST,
  USA_TEMP_CONDITIONS,
  STATS,
  LAST_MONTH_STATS,
  INFO,
  SUNSPOTS,
  WINDCHILL,
}

export const SCREEN_NAMES = {
  [Screens.ALERTS]: "Alerts",
  [Screens.FORECAST]: "Forecast",
  [Screens.OUTLOOK]: "Outlook",
  [Screens.ALMANAC]: "Almanac",
  [Screens.AQHI_WARNING]: "AQHI Warning",
  [Screens.PROVINCE_PRECIP]: "Province Temp/Precip",
  [Screens.CANADA_TEMP_CONDITIONS_MB]: "Conditions in Manitoba",
  [Screens.CANADA_TEMP_CONDITIONS_WEST]: "Conditions on the West Coast",
  [Screens.CANADA_TEMP_CONDITIONS_EAST]: "Conditions on the East Coast",
  [Screens.USA_TEMP_CONDITIONS]: "Conditions in the USA",
  [Screens.STATS]: "Weather Station Stats",
  [Screens.LAST_MONTH_STATS]: "Last month's stats",
  [Screens.INFO]: "Info screen",
  [Screens.SUNSPOTS]: "Sunspot forecast",
  [Screens.WINDCHILL]: "Windchill Explanation",
};

export const SCREEN_DESCRIPTIONS = {
  [Screens.ALERTS]: "Paginated alerts/warnings/watches/etc.",
  [Screens.FORECAST]:
    "Current conditions (without pressure) with the most immediate forecast (including relevant warning/watch) and two more forecast only pages",
  [Screens.OUTLOOK]: "Long-term forecast for the current city - displays high/low temps and expected conditions",
  [Screens.ALMANAC]: "Current conditions and high/low temperature info for last year, normal, and the record",
  [Screens.AQHI_WARNING]: "Relevant warning screen if AQHI for the current weather station is above 3",
  [Screens.PROVINCE_PRECIP]: "Highest or lowest recorded temperature for the day plus the previous day's precipitation",
  [Screens.CANADA_TEMP_CONDITIONS_MB]: "List of Manitoba cities with the current temperature and conditions",
  [Screens.CANADA_TEMP_CONDITIONS_WEST]: "List of West-coast cities with the current temperature and conditions",
  [Screens.CANADA_TEMP_CONDITIONS_EAST]: "List of East-coast cities with the current temperature and conditions",
  [Screens.USA_TEMP_CONDITIONS]: "List of US cities with the current temperature and conditions",
  [Screens.STATS]:
    "Screen showing sunrise/set for the day, along with seasonal precipitation stats and the hot/cold spots in Canada",
  [Screens.LAST_MONTH_STATS]:
    "Statitics about the last month with temperature, precipitation, and hotest/coldest days recorded",
  [Screens.INFO]: "Custom text only info screens written by the user",
  [Screens.SUNSPOTS]: "List of forecast for warmer cities during the winter",
  // [Screens.RANDOM]: "Random selection from a pre-determined list of screens",
  [Screens.WINDCHILL]: "Explains the windchill numbers",
};

export const SCREENS_WITH_AUTO_DURATION = [Screens.ALERTS, Screens.FORECAST];

export const SCREEN_DEFAULT_DISPLAY_LENGTH = 14 as const;
export const SCREEN_MIN_DISPLAY_LENGTH = 10 as const;
export const SCREEN_ALERT_DISPLAY_LENGTH = 300 as const;
export const SCREEN_INFO_DISPLAY_LENGTH = 14 * 25;
export const SCREEN_FORECAST_DISPLAY_LENGTH = 180 as const;

export const SCREEN_BACKGROUND_BLUE = "rgb(0,0,135)";
export const SCREEN_BACKGROUND_RED = "#610b00";
