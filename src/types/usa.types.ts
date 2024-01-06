export type USAStationConfig = {
  name: string;
  code: string;
  isBackup?: boolean;
};

export type USAStationObservation = {
  name: string;
  code: string;
  temperature: number | null;
  condition: string | null;
  abbreviatedCondition?: string;
  conditionUUID?: string;
};

export type USAStationObservations = USAStationObservation[];
