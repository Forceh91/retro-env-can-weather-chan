import axios from "lib/axios";
import { useEffect, useState } from "react";
import { CrawlerFields } from "types";

const FETCH_CRAWLER_INTERVAL = (60 * 1000) * 0.5;
const CRAWLER_DEFAULT_SPEED = 125;

// tell the channel to fetch the crawler once every interval
export function useCrawlerData() {
  const [crawlerMessages, setCrawlerMessages] = useState<CrawlerFields["messages"]>([]);
  const [crawlerSpeed, setCrawlerSpeed] = useState<CrawlerFields["speed"]>(CRAWLER_DEFAULT_SPEED);

  const fetchCrawlerData = () => {
    axios
      .get("crawler/crawlerData")
      .then((resp) => {
        const { data } = resp;
        if (!data) return;
        setCrawlerMessages(data.messages);
        setCrawlerSpeed(data.speed);
      })
      .catch();
  };

  useEffect(() => {
    fetchCrawlerData();
    setInterval(() => fetchCrawlerData(), FETCH_CRAWLER_INTERVAL);
  }, []);

  const crawlerData = {crawlerMessages, crawlerSpeed};

  return { crawlerData };
}
