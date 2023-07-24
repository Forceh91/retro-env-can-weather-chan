import { format } from "date-fns";

export function formatDisplayDate(timestamp: number) {
  return format(timestamp, `EEE  MMM  dd`)
    .replace(/tue\s/gi, "tues")
    .replace(/thu\s/gi, "thur")
    .replace(/jun\s/gi, "june")
    .replace(/jul\s/gi, "july")
    .replace(/sep/gi, "sept");
}
