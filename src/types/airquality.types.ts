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
