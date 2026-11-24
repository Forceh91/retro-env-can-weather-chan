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

export type PrimaryLocation = { province: string; location: string; name: string };

export type ClimateNormals = { stationID: number; climateID: number; province: string };

export type LookAndFeel = { font: string; flavour: string };

/**
 * When the simulator runs its "reload" (jumps back to the forecast and replays the refresh animation).
 * - `observation`: whenever a new observation arrives (about once an hour). The historical simulator behaviour.
 * - `observation-changes`: as above, plus whenever the forecast changes or a new alert is issued.
 * - `ten-minute`: on a fixed ten minute clock (:00, :10, :20...) and never in real time. Closest to the original channel.
 * - `ten-minute-alerts`: the ten minute clock, plus an extra refresh whenever a new alert is issued.
 */
export type RefreshMode = "observation" | "observation-changes" | "ten-minute" | "ten-minute-alerts";

export type MiscConfig = {
  rejectInHourConditionUpdates?: boolean;
  alternateRecordsSource?: string;
  refreshMode?: RefreshMode;
};

export type InitChannel = {
  config: { font: string; provinceHighLowEnabled: boolean; configVersion?: string; refreshMode?: RefreshMode };
  crawler: CrawlerMessages;
  /** only the ones that should be shown today */
  infoScreens: InfoScreenEntry[];
  flavour: Flavour;
  music: string[];
};

export type CrawlerMessages = string[];
