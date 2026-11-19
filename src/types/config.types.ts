import { Flavour, FlavourNames } from "./flavour.types";
import { InfoScreenEntry } from "./infoscreen.types";
import { ProvinceStation } from "./provincetracking.types";

export type ConfigFields = {
  primaryLocation: PrimaryLocation;
  provinceHighLowEnabled?: boolean;
  historicalDataStationID?: number;
  climateNormals?: ClimateNormals;
  lookAndFeel?: LookAndFeel;
  misc?: MiscConfig;
  flavour: Flavour;
  flavours: FlavourNames;
  provinceStations: ProvinceStation[];
  airQualityStation: string;
  crawler: string[];
  infoScreens: InfoScreenEntry[];
  music: string[];
};

export type PrimaryLocation = {
  province: string;
  location: string;
  name: string;
};

export type ClimateNormals = {
  stationID: number;
  climateID: number;
  province: string;
};

export type LookAndFeel = {
  font: string;
  flavour: string;
};

export type MiscConfig = {
  rejectInHourConditionUpdates?: boolean;
  alternateRecordsSource?: string;
};

export type InitChannel = {
  config: { font: string; provinceHighLowEnabled: boolean; configVersion?: string };
  crawler: CrawlerMessages;
  /** only the ones that should be shown today */
  infoScreens: InfoScreenEntry[];
  flavour: Flavour;
  music: string[];
};

export type CrawlerMessages = string[];
