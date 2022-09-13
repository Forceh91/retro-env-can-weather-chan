import { parseISO, format, addDays, subDays } from "date-fns";

export default {
  name: "observed-mixin",
  methods: {
    formatObservedLong(date, handleMid) {
      if (!date) return "";

      const parsedDate = parseISO(date.time);
      const timeZone = date.timezone;

      const hours = parsedDate.getHours();
      let hourTimezoneFormat = `hh aa `;
      // we need to double space after timezone if its a single digit hour
      // otherwise it should be a single space because 10/11 eat into that space
      let timeZoneString = `'${timeZone}&nbsp;'`;
      if (hours < 10 || (hours > 12 && hours < 22)) timeZoneString = `'${timeZone}&nbsp;&nbsp;'`;

      // ammend this onto the hour format
      hourTimezoneFormat += timeZoneString;

      // handle midnight/noon
      if (handleMid) {
        if (hours === 12) hourTimezoneFormat = `'${this.padString("Noon", 10)}'`;
        if (hours === 0) hourTimezoneFormat = `'${this.padString("Midnight", 10)}'`;
      }

      // put it all together and format
      const monthDateYearFormat = `MMM dd/yy`;
      const dateString = format(parsedDate, `${hourTimezoneFormat}${monthDateYearFormat}`);

      // clear out leading 0s from time/date as we dont want those
      const displayDateString = dateString.replace(/0([0-9])/, "$1").replace(/\s0/, "&nbsp;&nbsp;");
      return displayDateString;
    },

    getDaysAheadFromObserved(date, numberOfDays) {
      // we can go 6 days ahead of the observed date
      numberOfDays = numberOfDays || 6;

      // lets turn it into a date and then count forward
      const parsedDate = parseISO(date.time);
      const daysAhead = addDays(parsedDate, numberOfDays);

      return daysAhead;
    },

    getDaysBehindFromObserved(date, numberOfDays) {
      // we can go back anytime but default to 1
      numberOfDays = numberOfDays || 1;

      // turn it into a date and count back
      const parsedDate = parseISO(date.time);
      const daysBehind = subDays(parsedDate, numberOfDays);

      return daysBehind;
    },
  },
};
