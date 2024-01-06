import axios from "lib/axios";
import { useEffect, useState } from "react";
import { SunspotStationObservations } from "types";

const FETCH_SUNSPOTS_INTERVAL = 60 * 1000 * 1;

export function useSunspots() {
  const [sunspots, setSunspots] = useState<SunspotStationObservations>();

  const fetchSunspots = () => {
    axios
      .get("weather/sunspots")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setSunspots(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchSunspots();
    setInterval(() => fetchSunspots(), FETCH_SUNSPOTS_INTERVAL);
  }, []);

  return { sunspots };
}
