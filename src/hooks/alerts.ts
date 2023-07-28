import axios from "lib/axios";
import { useEffect, useState } from "react";
import { CAPObject } from "types";

// tell the channel to fetch the config once every 15mins
export function useAlerts() {
  const [alerts, setAlerts] = useState<CAPObject[]>([]);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchAlerts = () => {
    axios
      .get("weather/alerts")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setAlerts(data.alerts);
      })
      .catch()
      .finally(() => setHasFetched(true));
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return { alerts, hasFetched, mostImportantAlert: alerts[0] ?? null };
}
