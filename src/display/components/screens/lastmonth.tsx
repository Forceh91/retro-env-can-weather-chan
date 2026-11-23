import { format, isValid, subMonths } from "date-fns";
import { useEffect } from "react";
import { centreOnGrid } from "lib/display";
import { LastMonth } from "types";
import { AutomaticScreenProps } from "types/screen.types";

// the values are right aligned and the first one ends on column 21, the normals on column 30 (reference screen 12)
const LABEL_COLUMNS = 16;

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
      <div>{centreOnGrid(`Weather Statistics for ${month}`)}</div>
      <div>
        {"".padStart(2)}
        {city.slice(0, 11).padEnd(12)}This Year{"".padStart(2)}Normal
      </div>
      <div>
        {"Average High".padEnd(LABEL_COLUMNS)}
        {formatNumber(lastMonth.actual?.averageHigh)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.max)}
      </div>
      <div>
        {"Average Low".padEnd(LABEL_COLUMNS)}
        {formatNumber(lastMonth.actual?.averageLow)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.min)}
      </div>
      <div>
        {"Mean Temp".padEnd(LABEL_COLUMNS)}
        {formatNumber(lastMonth.actual?.averageTemp)}
        {"".padStart(4)}
        {formatNumber(lastMonth.normal?.temperature.mean)}
      </div>
      <div>
        {"Precip (MM)".padEnd(LABEL_COLUMNS)}
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
