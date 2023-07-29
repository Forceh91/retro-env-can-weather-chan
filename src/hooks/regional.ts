import axios from "lib/axios";
import { useEffect, useState } from "react";
import { RegionalWeather } from "types";

const FETCH_REGIONAL_WEATHER_INTERVAL = 60 * 1000 * 1;

// tell the channel to fetch the config once every 15mins
export function useRegionalWeather() {
  const [regionalWeather, setRegionalWeather] = useState<RegionalWeather>();

  const fetchRegionalWeather = () => {
    axios
      .get("weather/regional")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setRegionalWeather(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchRegionalWeather();
    setInterval(() => fetchRegionalWeather(), FETCH_REGIONAL_WEATHER_INTERVAL);
  }, []);

  return { regionalWeather };
}
