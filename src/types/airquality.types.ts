export type AQHIObservation = {
  day: number;
  month: number;
  hour: number;
  isPM: boolean;
  /** When false, `hour` is 0–23 (MSC `clock="24h"`). When true/omitted, interpret with `isPM` (#997). */
  clock12h?: boolean;
  value: number;
};

export type AQHIObservationResponse = {
  textValue?: string;
  showWarning?: boolean;
} & AQHIObservation;

export type AirQualityStation = {
  zone: string;
  code: string;
  name: string;
};

export type AirQualityStations = AirQualityStation[];
