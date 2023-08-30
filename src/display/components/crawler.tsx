import Marquee from "react-fast-marquee";
import { CrawlerMessages } from "types";

type CrawlerMessagesProps = {
  crawler: CrawlerMessages;
};

export function CrawlerMessages({ crawler }: CrawlerMessagesProps) {
  return (
    <div id="crawler">
      <Marquee loop={0} speed={125}>
        <div className="message"></div>
        {crawler?.length &&
          crawler.map((message, ix) => (
            <div className="message" key={`crawler.${ix}`}>
              {message}
            </div>
          ))}
      </Marquee>
    </div>
  );
}
