import { addMinutes, format } from "date-fns";
import { formatDisplayDate } from "lib/date";
import { useEffect, useState } from "react";

type FooterBarProps = {
  timeOffset: number;
};

export function FooterBar(props: FooterBarProps) {
  const { timeOffset } = props ?? {};

  const [time, setTime] = useState<Date>(new Date());
  useEffect(() => {
    setInterval(() => {
      setTime(addMinutes(new Date(), timeOffset));
    }, 1000);
  }, []);

  const formattedTime = format(time, "HH:mm:ss");
  const formattedDate = formatDisplayDate(time.getTime());

  return (
    <div id="footer_bar">
      <div id="time_date">
        TIME {formattedTime}
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{formattedDate}
      </div>
      <div id="header">Environment Canada Weather</div>
    </div>
  );
}
