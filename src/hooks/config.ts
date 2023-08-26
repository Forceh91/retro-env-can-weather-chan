import axios from "lib/axios";
import { useEffect, useState } from "react";
import { ConfigFields } from "types";

// tell the channel to fetch the config once every 15mins
export function useChannelCurrentConfig() {
  const [config, setConfig] = useState<ConfigFields>();
  const [fetched, setHasFetched] = useState(false);

  const fetchConfig = () => {
    axios
      .get("/config")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;

        setConfig({ ...data.config, flavour: data.flavour });
      })
      .catch()
      .finally(() => setHasFetched(true));
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return { config, fetched };
}
