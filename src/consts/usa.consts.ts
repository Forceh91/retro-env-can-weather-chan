import { USAStationConfig } from "types";

export const USA_WEATHER_STATIONS: USAStationConfig[] = [
  { name: "Grand Forks", code: "KGFK" },
  { name: "Fargo", code: "KFAR" },
  { name: "Minneapolis", code: "KMSP" },
  { name: "Chicago", code: "KORD" },
  { name: "Las Vegas", code: "KVGT" },
  { name: "Tampa", code: "KTPA" },
  { name: "Los Angeles", code: "KLAX" },
  { name: "Denver", code: "KBKF", isBackup: true },
  { name: "Detroit", code: "KDET", isBackup: true },
  { name: "New York", code: "KNYC", isBackup: true },
  { name: "Miami", code: "KMIA", isBackup: true },
  { name: "Santa Fe", code: "KSAF", isBackup: true },
  { name: "Dallas", code: "KDFW", isBackup: true },
  { name: "Seattle", code: "KSEA", isBackup: true },
];

export const MAX_USA_STATIONS_PER_PAGE = 7;
export const MAX_USA_STATION_NAME_LENGTH = 13;
export const MIN_USA_STATIONS_NEEDED_TO_DISPLAY = 2;
