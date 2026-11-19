import { addMinutes, format } from "date-fns";
import { formatDisplayDate } from "lib/date";
import { useEffect, useRef, useState } from "react";

// spaces between the time and the date, keeps the footer block narrow like the original.
// "TIME hh:mm:ss" (13) + the date (always 12) + this gap is the width of the block, and it needs to be an even number of
// columns so that centring it in the 32 column display lands it on the grid, not between two columns (so: odd gap)
const TIME_DATE_GAP = 3;

type FooterBarProps = {
  timeOffset: number;
};

export function FooterBar(props: FooterBarProps) {
  const { timeOffset } = props ?? {};
  const [time, setTime] = useState<Date>(new Date());
  const timerInterval = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    timerInterval.current = setInterval(() => {
      setTime(addMinutes(new Date(), timeOffset));
    }, 1000);

    return () => {
      timerInterval.current && clearInterval(timerInterval.current);
    };
  }, [timeOffset]);

  const formattedTime = format(time, "HH:mm:ss");
  const formattedDate = formatDisplayDate(time.getTime());

  return (
    <div id="footer_bar">
      <div id="footer_grid">
        <div id="time_date">
          TIME {formattedTime}
          {"".padStart(TIME_DATE_GAP)}
          {formattedDate}
        </div>
        <div id="header">Environment Canada Weather</div>
      </div>
    </div>
  );
}
