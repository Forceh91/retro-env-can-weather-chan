import { ECCCUnitNumber } from "./eccc.types";

export type WeatherStationTimeData = {
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
  speed: ECCCUnitNumber;
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
