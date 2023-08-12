import { addMinutes, format } from "date-fns";
import { formatDisplayDate } from "lib/date";
import { useEffect, useRef, useState } from "react";

type FooterBarProps = {
  timeOffset: number;
};

export function FooterBar(props: FooterBarProps) {
  const { timeOffset } = props ?? {};
  const [time, setTime] = useState<Date>(new Date());
  const timerInterval = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      timerInterval.current && clearInterval(timerInterval.current);
    };
  }, [timeOffset]);

  const formattedTime = format(addMinutes(time, timeOffset), "HH:mm:ss");
  const formattedDate = formatDisplayDate(time.getTime());

  return (
    <div id="footer_bar">
      <div id="time_date">
        TIME {formattedTime}
        {"".padStart(5)}
        {formattedDate}
      </div>
      <div id="header">Environment Canada Weather</div>
    </div>
  );
}
