import axios from "lib/axios";
import { useEffect, useState } from "react";
import { HotColdSpots } from "types";

const FETCH_HOT_COLD_SPOT_INTERVAL = 60 * 1000 * 30;

// tell the channel to fetch hot/cold spots once every 30 mins
export function useCanadaHotColdSpots() {
  const [hotColdSpots, setHotColdSpots] = useState<HotColdSpots>();

  const fetchHotColdSpots = () => {
    axios
      .get("weather/hotcoldspots")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setHotColdSpots(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchHotColdSpots();
    setInterval(() => fetchHotColdSpots(), FETCH_HOT_COLD_SPOT_INTERVAL);
  }, []);

  return { hotColdSpots };
}
