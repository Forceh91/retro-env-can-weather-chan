import axios from "lib/axios";
import { useEffect, useState } from "react";
import { ProvinceTracking } from "types";

const FETCH_PROVINCE_TRACKING_INTERVAL = 60 * 1000 * 1;

export function useProvinceTracking() {
  const [provinceTracking, setProvinceTracking] = useState<ProvinceTracking>();

  const fetchProvinceTracking = () => {
    axios
      .get("weather/province")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setProvinceTracking(data);
      })
      .catch();
  };

  useEffect(() => {
    fetchProvinceTracking();
    setInterval(() => fetchProvinceTracking(), FETCH_PROVINCE_TRACKING_INTERVAL);
  }, []);

  return { provinceTracking };
}
