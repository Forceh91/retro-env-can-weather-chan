export type ProvinceStation = {
  name: string;
  code: string;
};

export type ProvinceStations = ProvinceStation[];

export type ProvinceStationTracking = {
  station: ProvinceStation;
  minTemp: number | null;
  maxTemp: number | null;
  displayTemp: number | string;
  yesterdayPrecip: number | string | null;
};

export type ProvinceTracking = {
  tracking: ProvinceStationTracking[];
  isOvernight: boolean;
  yesterdayPrecipDate: string;
};
