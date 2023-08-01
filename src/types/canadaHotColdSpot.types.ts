export type HotColdSpot = {
  name: string;
  province: string;
  temperature: number;
};

export type HotColdSpots = {
  hotSpot: HotColdSpot;
  coldSpot: HotColdSpot;
  lastUpdated: string;
};
