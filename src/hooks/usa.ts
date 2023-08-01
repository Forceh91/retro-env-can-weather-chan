import axios from "lib/axios";
import { useEffect, useState } from "react";
import { USAStationObservations } from "types";

const FETCH_USA_WEATHER_INTERVAL = 60 * 1000 * 1;

// tell the channel to fetch the config once every 15mins
export function useUSAWeather() {
  const [usaWeather, setUSAWeather] = useState<USAStationObservations>();

  const fetchUSAWeather = () => {
    axios
      .get("weather/usa")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setUSAWeather(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchUSAWeather();
    setInterval(() => fetchUSAWeather(), FETCH_USA_WEATHER_INTERVAL);
  }, []);

  return { usaWeather };
}
