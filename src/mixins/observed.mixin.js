import { parseISO, format } from "date-fns";

export default {
  name: "observed-mixin",
  methods: {
    formatObservedLong(date, handleMid) {
      if (!date) return "";

      const parsedDate = parseISO(date.time);
      const timeZone = date.timezone;

      let hourTimezoneFormat = `hh aa '${timeZone}&nbsp;'`;
      // handle midnight/noon
      if (handleMid) {
        const hours = parsedDate.getHours();
        if (hours === 12) hourTimezoneFormat = `'${this.padString("Noon", 10)}'`;
        if (hours === 0) hourTimezoneFormat = `'${this.padString("Midnight", 10)}'`;
      }

      // put it all together and format
      const monthDateYearFormat = `MMM dd/yy`;
      const dateString = format(parsedDate, `${hourTimezoneFormat}${monthDateYearFormat}`);

      // clear out leading 0s from time/date as we dont want those
      const displayDateString = dateString.replace(/0([0-9])/, "&nbsp$1").replace(/\s0/, "&nbsp;&nbsp;");
      return displayDateString;
    },
  },
};
