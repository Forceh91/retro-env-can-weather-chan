export type SunspotStationConfig = {
  name: string;
  code: string;
  x: number;
  y: number;
};

export type SunspotStationObservation = {
  name: string;
  code: string;
  forecast: string | null;
  abbreviatedForecast?: string;
  highTemp: number;
  lowTemp: number;
};

export type SunspotStationObservations = SunspotStationObservation[];
