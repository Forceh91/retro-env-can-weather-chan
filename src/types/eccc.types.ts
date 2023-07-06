export type ECCCConditions = {
  condition: string;
  temperature: ECCCUnitString;
  pressure: ECCCPressure;
  visibility: ECCCUnitString;
  relativeHumidity: ECCCUnitString;
  wind: ECCCWind;
};

export type ECCCUnit = {
  unitType?: string;
  units: string;
};

export type ECCCUnitString = {
  value: string;
} & ECCCUnit;

export type ECCCUnitNumber = {
  value: number;
} & ECCCUnit;

export type ECCCPressure = {
  change: string;
  tendency: string;
} & ECCCUnitString;

export type ECCCWind = {
  speed: ECCCUnitString;
  gust: ECCCUnitString;
  direction: string;
};
