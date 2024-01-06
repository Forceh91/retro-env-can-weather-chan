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
};

export type Flavours = Flavour[];

export type FlavourNames = string[];
