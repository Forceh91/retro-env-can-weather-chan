import axios from "lib/axios";
import { useEffect, useState } from "react";
import { NationalWeather } from "types";

const FETCH_NATIONAL_WEATHER_INTERVAL = 60 * 1000 * 1;

// tell the channel to fetch the config once every 15mins
export function useNationalWeather() {
  const [nationalWeather, setNationalWeather] = useState<NationalWeather>();

  const fetchNationalWeather = () => {
    axios
      .get("weather/national")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setNationalWeather(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchNationalWeather();
    setInterval(() => fetchNationalWeather(), FETCH_NATIONAL_WEATHER_INTERVAL);
  }, []);

  return { nationalWeather, fetchNationalWeather };
}
