import { SCREEN_DEFAULT_DISPLAY_LENGTH, SCREEN_FORECAST_DISPLAY_LENGTH, Screens } from "./screens.consts";

export const FLAVOUR_DIRECTORY = "cfg/flavours";
export const FLAVOUR_NAME_MAX_LENGTH = 32;

export const FLAVOUR_DEFAULT = {
  name: "default",
  created: "2023-07-23T15:39:40",
  modified: "2023-07-23T15:39:40",
  screens: [
    {
      id: Screens.FORECAST,
      duration: SCREEN_FORECAST_DISPLAY_LENGTH,
    },
    {
      id: Screens.OUTLOOK,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.ALMANAC,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.ALERTS,
      duration: 0,
    },
    {
      id: Screens.AQHI_WARNING,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.PROVINCE_PRECIP,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.CANADA_TEMP_CONDITIONS_MB,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.CANADA_TEMP_CONDITIONS_WEST,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.CANADA_TEMP_CONDITIONS_EAST,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.USA_TEMP_CONDITIONS,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.SUNSPOTS,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.STATS,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.LAST_MONTH_STATS,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    {
      id: Screens.WINDCHILL,
      duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    },
    // {
    //   id: Screens.INFO,
    //   duration: SCREEN_DEFAULT_DISPLAY_LENGTH,
    // },
    {
      id: Screens.ALERTS,
      duration: 0,
    },
  ],
};
