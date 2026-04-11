import { DEFAULT_WEATHER_STATION_ID } from "./server.consts";

/** Climate `stationID` values for ECCC bulk daily XML (province grid fallback). */
export const PROVINCE_TRACKING_DEFAULT_STATIONS = [
  { name: "Winnipeg", code: `MB/${DEFAULT_WEATHER_STATION_ID}`, climateStationId: 3698 },
  { name: "Portage", code: "MB/s0000626", climateStationId: 10884 },
  { name: "Brandon", code: "MB/s0000492", climateStationId: 50821 },
  { name: "Dauphin", code: "MB/s0000508", climateStationId: 26866 },
  { name: "Kenora", code: "ON/s0000651", climateStationId: 51137 },
  { name: "Thompson", code: "MB/s0000695", climateStationId: 3905 },
];

export const PROVINCE_TRACKING_TEMP_TO_TRACK = {
  MIN_TEMP: "min",
  MAX_TEMP: "max",
};

export const PROVINCE_TRACKING_MAX_STATIONS = 6;
