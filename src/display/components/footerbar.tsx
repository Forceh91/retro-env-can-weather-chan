import { format } from "date-fns";
import { formatDisplayDate } from "lib/date";
import { useEffect, useState } from "react";

export function FooterBar() {
  const [time, setTime] = useState<number>(Date.now());
  useEffect(() => {
    setInterval(() => {
      setTime(Date.now());
    }, 1000);
  }, []);

  const formattedTime = format(time, "HH:mm:ss");
  const formattedDate = formatDisplayDate(time);

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
