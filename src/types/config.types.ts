import { Flavour } from "./flavour.types";
import { ProvinceStation } from "./provincetracking.types";

export type ConfigFields = {
  primaryLocation: PrimaryLocation;
  provinceHighLowEnabled?: boolean;
  historicalDataStationID?: number;
  climateNormals?: ClimateNormals;
  lookAndFeel?: LookAndFeel;
  misc?: MiscConfig;
  flavour: Flavour;
  provinceStations: ProvinceStation[];
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
  config: { font: string; provinceHighLowEnabled: boolean };
  crawler: string[];
  flavour: Flavour;
  music: string[];
};
