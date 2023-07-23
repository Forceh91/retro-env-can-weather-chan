import { Flavour } from "./flavour.types";

export type ConfigFields = {
  primaryLocation: PrimaryLocation;
  provinceHighLowEnabled?: boolean;
  historicalDataStationID?: number;
  climateNormals?: ClimateNormals;
  lookAndFeel?: LookAndFeel;
  misc?: MiscConfig;
  flavour: Flavour;
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
