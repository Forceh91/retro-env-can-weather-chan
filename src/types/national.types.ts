export type NationalStationConfig = {
  name: string;
  code: string;
  isBackup?: boolean;
};

export type NationalStationObservation = {
  name: string;
  code: string;
  temperature: number | null;
  condition: string | null;
  abbreviatedCondition?: string;
  conditionUUID?: string;
};

export type NationalStationObservations = NationalStationObservation[];

export type NationalWeather = {
  mb: NationalStationObservations;
  on: NationalStationObservations;
  east: NationalStationObservations;
  west: NationalStationObservations;
};
