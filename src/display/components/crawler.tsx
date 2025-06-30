import Marquee from "react-fast-marquee";

type CrawlerBarProps = {
  messages: string[];
  speed: number;
};


export function CrawlerBar({ messages, speed }: CrawlerBarProps) {
  if (!messages?.length) return <div id="crawler"></div>;

  return (
    <div id="crawler">
      <Marquee loop={0} speed={speed}>
        <div className="message"></div>
        {messages.map((message, ix) => (
          <div className="message" key={`messages.${ix}`}>
            {message}
          </div>
        ))}
      </Marquee>
    </div>
  );
}
