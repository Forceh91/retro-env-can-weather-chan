import { DEFAULT_WEATHER_STATION_ID } from "./server.consts";

export const PROVINCE_TRACKING_DEFAULT_STATIONS = [
  { name: "Winnipeg", code: `MB/${DEFAULT_WEATHER_STATION_ID}` },
  { name: "Portage", code: "MB/s0000626" },
  { name: "Brandon", code: "MB/s0000492" },
  { name: "Dauphin", code: "MB/s0000508" },
  { name: "Kenora", code: "ON/s0000651" },
  { name: "Thompson", code: "MB/s0000695" },
];

export const PROVINCE_TRACKING_TEMP_TO_TRACK = {
  MIN_TEMP: "min",
  MAX_TEMP: "max",
};
