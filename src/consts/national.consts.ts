import { NationalStationConfig } from "types";

export const MB_WEATHER_STATIONS: NationalStationConfig[] = [
  { name: "Portage", code: "MB/s0000626" },
  { name: "Brandon", code: "MB/s0000492" },
  { name: "Dauphin", code: "MB/s0000508" },
  { name: "Kenora", code: "ON/s0000651" },
  { name: "Thompson", code: "MB/s0000695" },
  { name: "The Pas", code: "MB/s0000644" },
  { name: "Lynn Lake", code: "MB/s0000777" },
  { name: "Churchill", code: "MB/s0000779", isBackup: true },
  { name: "Sx. Lookout", code: "ON/s0000748", isBackup: true },
  { name: "Red Lake", code: "ON/s0000676", isBackup: true },
  { name: "Flin Flon", code: "MB/s0000015", isBackup: true },
  { name: "Norway House", code: "MB/s0000616", isBackup: true },
  { name: "Dryden", code: "ON/s0000546", isBackup: true },
  { name: "Gillam", code: "MB/s0000543", isBackup: true },
];

export const ON_WEATHER_STATIONS: NationalStationConfig[] = [
  { name: "Toronto", code: "ON/s0000458" },
  { name: "Oakville", code: "ON/s0000367" },
  { name: "Hamilton", code: "ON/s0000549" },
  { name: "Niagara Falls", code: "ON/s0000692" },
  { name: "Kingston", code: "ON/s0000531" },
  { name: "Ottawa", code: "ON/s0000430" },
  { name: "Sudbury", code: "ON/s0000680" },
  { name: "London", code: "ON/s0000326", isBackup: true },
  { name: "Windsor", code: "ON/s0000646", isBackup: true },
  { name: "Kenora", code: "ON/s0000651", isBackup: true },
  { name: "Timmins", code: "ON/s0000705", isBackup: true },
  { name: "North Bay", code: "ON/s0000765", isBackup: true },
  { name: "Windsor", code: "ON/s0000646", isBackup: true },
  { name: "Wawa", code: "ON/s0000761", isBackup: true },
];

export const WEST_WEATHER_STATIONS: NationalStationConfig[] = [
  { name: "Vancouver", code: "BC/s0000141" },
  { name: "Victoria", code: "BC/s0000775" },
  { name: "Edmonton", code: "AB/s0000510" },
  { name: "Calgary", code: "AB/s0000047" },
  { name: "Saskatoon", code: "SK/s0000797" },
  { name: "Regina", code: "SK/s0000788" },
  { name: "Thunder Bay", code: "ON/s0000411" },
  { name: "Whitehorse", code: "YT/s0000825", isBackup: true },
  { name: "Yellowknife", code: "NT/s0000366", isBackup: true },
  { name: "Medicine Hat", code: "AB/s0000745", isBackup: true },
  { name: "Lethbridge", code: "AB/s0000652", isBackup: true },
  { name: "Kelowna", code: "BC/s0000592", isBackup: true },
  { name: "Kamloops", code: "BC/s0000568", isBackup: true },
  { name: "Yorkton", code: "SK/s0000663", isBackup: true },
];

export const EAST_WEATHER_STATIONS: NationalStationConfig[] = [
  { name: "Toronto", code: "ON/s0000458" },
  { name: "Ottawa", code: "ON/s0000623" },
  { name: "Montreal", code: "QC/s0000635" },
  { name: "Quebec City", code: "QC/s0000620" },
  { name: "Fredericton", code: "NB/s0000250" },
  { name: "Halifax", code: "NS/s0000318" },
  { name: "St. John's", code: "NL/s0000280" },
  { name: "Charlottet'n", code: "PE/s0000583", isBackup: true },
  { name: "London", code: "ON/s0000326", isBackup: true },
  { name: "Moncton", code: "NB/s0000654", isBackup: true },
  { name: "Sydney", code: "NS/s0000670", isBackup: true },
  { name: "Windsor", code: "NS/s0000438", isBackup: true },
  { name: "Sudbury", code: "ON/s0000680", isBackup: true },
  { name: "Gander", code: "NL/s0000667", isBackup: true },
];

export const MAX_NATIONAL_STATIONS_PER_PAGE = 7;
export const MAX_NATIONAL_STATION_NAME_LENGTH = 13;
export const MIN_NATIONAL_STATIONS_NEEDED_TO_DISPLAY = 2;
export const NATIONAL_WEATHER_FETCH_INTERVAL = 5 * 60 * 1000;
