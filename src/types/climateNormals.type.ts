export type ClimateNormalSeasonPrecip = {
  amount: number;
  unit: string;
};

export type ClimateNormalsForMonth = {
  temperature: {
    min: number;
    max: number;
  };
  precip: {
    amount: number;
  };
};
