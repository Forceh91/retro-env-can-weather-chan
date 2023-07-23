import { Screens } from "consts";

export type Flavour = {
  name: string;
  created: Date;
  modified: Date;
  screens: FlavourScreen[];
};

export type FlavourScreen = {
  id: Screens;
  duration: number;
};
