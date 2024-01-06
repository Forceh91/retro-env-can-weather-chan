import axios from "lib/axios";
import { useState } from "react";
import { Season } from "types";

export function useSeason() {
  const [season, setSeason] = useState<Season>();

  const fetchSeason = () => {
    axios
      .get("season")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setSeason(data);
      })
      .catch();
  };

  return { season, fetchSeason };
}
