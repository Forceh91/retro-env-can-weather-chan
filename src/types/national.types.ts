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
};

export type NationalStationObservations = NationalStationObservation[];

export type RegionalWeather = {
  mb: NationalStationObservations;
  east: NationalStationObservations;
  west: NationalStationObservations;
};
