import axios from "lib/axios";
import { useState } from "react";
import { LastMonth } from "types";

export function useLastMonth() {
  const [lastMonth, setLastMonth] = useState<LastMonth>();

  const fetchLastMonth = () => {
    axios
      .get("season/lastmonth")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setLastMonth(data);
      })
      .catch();
  };

  return { lastMonth, fetchLastMonth };
}
