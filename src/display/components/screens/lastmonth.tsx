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
    if (!city?.length || !lastMonth?.actual || !lastMonth?.normal) onComplete();
  }, []);

  if (!city?.length || !lastMonth?.actual || !lastMonth?.normal) return <></>;

  const month = format(subMonths(new Date(), 1), "MMMM");
  const formatNumber = (value: number) => (value !== undefined ? value.toFixed(1).padStart(5) : "N/A");
  const formatTemp = (value: number) =>
    value !== undefined ? ((value > 0 ? "+" : "") + value.toFixed(1)).padStart(5) : "N/A";
  const formatDayWithSuffix = (value: number) => {
    const date = subMonths(new Date(), 1);
    date.setDate(value);
    if (!isValid(date)) return value ?? "N/A";

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
        {formatNumber(lastMonth.actual?.averageHigh)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.max)}
      </div>
      <div>
        {"Average Low".padEnd(15)}
        {formatNumber(lastMonth.actual?.averageLow)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.min)}
      </div>
      <div>
        {"Mean Temp".padEnd(15)}
        {formatNumber(lastMonth.actual?.averageTemp)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.mean)}
      </div>
      <div>
        {"Precip (MM)".padEnd(15)}
        {formatNumber(lastMonth.actual?.totalPrecip)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.precip.amount)}
      </div>
      {/* on the original channel this line mentioned where in records the precip amount came (1st, 3rd, 9th, etc.)*/}
      <div>
        {"Warmest Temp.".padEnd(14)}
        {formatTemp(lastMonth.actual?.warmestDay.value)} on the {formatDayWithSuffix(lastMonth.actual?.warmestDay.day)}
      </div>
      <div>
        {"Coldest Temp.".padEnd(14)}
        {formatTemp(lastMonth.actual?.coldestDay.value)} on the {formatDayWithSuffix(lastMonth.actual?.coldestDay.day)}
      </div>
    </div>
  );
}
