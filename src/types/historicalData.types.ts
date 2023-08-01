export type HistoricalDataStat = {
  _attributes: HistoricalDataDay;
  totalrain: HistoricalDataItem;
  totalsnow: HistoricalDataItem;
  totalprecipitation: HistoricalDataItem;
  maxtemp: HistoricalDataItem;
  mintemp: HistoricalDataItem;
};

export type HistoricalDataStats = HistoricalDataStat[];

export type HistoricalDataItem = {
  _text: string;
  _attributes: HistoricalDataAttribute;
};

type HistoricalDataAttribute = {
  description: string;
  units: string;
};

type HistoricalDataDay = {
  day: string;
  month: string;
  year: string;
};

export type LastMonthDayValue = {
  day: number;
  value: number;
};

export type LastMonth = {
  actual: LastMonthSummary;
  normal: { temperature: { min: number; max: number }; precip: { amount: number } };
};

export type LastMonthSummary = {
  averageHigh: number;
  averageLow: number;
  totalPrecip: number;
  warmestDay: { day: number; value: number };
  coldestDay: { day: number; value: number };
};
