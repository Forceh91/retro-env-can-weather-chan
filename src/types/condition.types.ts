import { ECCCUnitNumber, ECCCUnitNumberString } from "./eccc.types";

export type WeatherStationTimeData = {
  observedDateTime: string;
  stationOffsetMinutesFromLocal: number;
  timezone: string;
};

export type ObservedConditions = {
  condition: string;
  abbreviatedCondition?: string;
  temperature: ECCCUnitNumber;
  pressure: Pressure;
  humidity: ECCCUnitNumber;
  visibility: ECCCUnitNumber;
  wind: Wind;
};

export type Pressure = {
  change: number;
  tendency: string;
} & ECCCUnitNumber;

export type Wind = {
  speed: ECCCUnitNumberString;
  gust: ECCCUnitNumber;
  direction: string;
};

export type SunRiseSet = {
  rise: string;
  set: string;
  timezone: string;
};

export type Almanac = {
  temperatures: {
    extremeMin: TemperatureRecord;
    extremeMax: TemperatureRecord;
    normalMin: TemperatureRecord;
    normalMax: TemperatureRecord;
  };
};

export type TemperatureRecord = {
  value: number;
  unit: string;
  year?: number;
};

export type Forecast = {
  period: string;
  textSummary: string;
  temperature: { value: number; class: string };
  conditions: string;
};

export type WeekForecast = Forecast[];

export type WeatherStation = {
  observationID: string;
  city: string;
  stationTime: WeatherStationTimeData;
  observed: ObservedConditions & { windchill: number | null };
  almanac: Almanac & { sunRiseSet: SunRiseSet };
  forecast: WeekForecast;
};
