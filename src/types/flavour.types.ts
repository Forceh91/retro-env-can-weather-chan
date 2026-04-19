import { Screens } from "consts";

export type Flavour = {
  name: string;
  uuid?: string;
  created: Date;
  modified: Date;
  screens: FlavourScreen[];
};

export type FlavourScreen = {
  id: Screens;
  duration: number;
  /** When true, last-month stats stay in rotation all month (default matches ECCC: days 1–5 only). */
  lastMonthStatsShowAllMonth?: boolean;
};

export type Flavours = Flavour[];

export type FlavourNames = string[];
