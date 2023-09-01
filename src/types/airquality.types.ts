export type AQHIObservation = {
  day: number;
  month: number;
  hour: number;
  isPM: boolean;
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
