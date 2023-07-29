export type RegionalStationConfig = {
  name: string;
  code: string;
  isBackup?: boolean;
};

export type RegionalStationObservation = {
  name: string;
  code: string;
  temperature: number | null;
  condition: string | null;
  abbreviatedCondition?: string;
};

export type RegionalStationObservations = RegionalStationObservation[];

export type RegionalWeather = {
  mb: RegionalStationObservations;
  east: RegionalStationObservations;
  west: RegionalStationObservations;
};
