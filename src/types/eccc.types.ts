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

export type ECCCSunRiseSet = {
  disclaimer: string;
  dateTime: ECCCDateTime[];
};

export type ECCCDateTime = {
  year: number;
  month: { name: string; value: string };
  day: { name: string; value: string };
  hour: string;
  minute: string;
  timeStamp: string;
  textSummary: string;
  name: string;
  zone: string;
  UTCOffset: string;
};
