import { format, isValid, subMonths } from "date-fns";
import { useEffect } from "react";
import { LastMonth } from "types";
import { AutomaticScreenProps } from "types/screen.types";

type LastMonthScreenProps = {
  city: string;
  lastMonth: LastMonth;
} & AutomaticScreenProps;

export function LastMonthScreen(props: LastMonthScreenProps) {
  const { city, lastMonth, onComplete } = props ?? {};

  useEffect(() => {
    // if there's no data just return
    if (!city?.length || !lastMonth) onComplete();
  }, []);

  if (!city?.length || !lastMonth) return <></>;

  const month = format(subMonths(new Date(), 1), "MMMM");
  const formatNumber = (value: number) => value.toFixed(1).toString().padStart(5);
  const formatTemp = (value: number) => ((value > 0 ? "+" : "") + value.toFixed(1).toString()).padStart(5);
  const formatDayWithSuffix = (value: number) => {
    const date = new Date();
    date.setDate(value);
    if (!isValid(date)) return value;

    return format(date, "do").padStart(4);
  };

  return (
    <div id="lastmonth_screen">
      <div>Weather Statistics for {month}</div>
      <div>
        &nbsp;{city.slice(0, 11).padEnd(11)}&nbsp;This Year{"".padStart(2)}Normal
      </div>
      <div>
        {"Average High".padEnd(15)}
        {formatNumber(lastMonth.actual.averageHigh)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal.temperature.max)}
      </div>
      <div>
        {"Average Low".padEnd(15)}
        {formatNumber(lastMonth.actual.averageLow)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal.temperature.min)}
      </div>
      <div>
        {"Precip (MM)".padEnd(15)}
        {formatNumber(lastMonth.actual.totalPrecip)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal.precip.amount)}
      </div>
      <br />
      {/* on the original channel this line mentioned where in records the precip amount came (1st, 3rd, 9th, etc.)*/}
      <div>
        {"Warmest Temp.".padEnd(14)}
        {formatTemp(lastMonth.actual.warmestDay.value)} on the {formatDayWithSuffix(lastMonth.actual.warmestDay.day)}.
      </div>
      <div>
        {"Coldest Temp.".padEnd(14)}
        {formatTemp(lastMonth.actual.coldestDay.value)} on the {formatDayWithSuffix(lastMonth.actual.coldestDay.day)}.
      </div>
    </div>
  );
}
