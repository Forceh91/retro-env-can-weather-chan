import axios from "lib/axios";
import { useEffect, useState } from "react";
import { AQHIObservationResponse } from "types";

// fetch air quality once every 15mins
const FETCH_AIR_QUALITY_INTERVAL = 60 * 1000 * 15;

export function useAirQuality() {
  const [airQuality, setAirQuality] = useState<AQHIObservationResponse>();

  const fetchAirQuality = () => {
    axios
      .get("airQuality")
      .then((resp) => {
        const { data }: { data: AQHIObservationResponse } = resp;
        if (!data) return;

        if (isNaN(data.value)) setAirQuality(null);
        else setAirQuality(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchAirQuality();
    setInterval(() => fetchAirQuality(), FETCH_AIR_QUALITY_INTERVAL);
  }, []);

  return { airQuality };
}
