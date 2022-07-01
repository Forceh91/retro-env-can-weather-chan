<template>
  <div id="last_month_summary">
    <div>
      <div>{{ summaryTitle }}</div>
      <div v-html="tableHeader"></div>
      <div v-html="averageHighData"></div>
      <div v-html="averageLowData"></div>
      <div v-html="precipData"></div>
      <br />
      <!-- this is normally pos in records -->
      <div v-html="warmestTempData"></div>
      <div v-html="coldestTempData"></div>
    </div>
  </div>
</template>

<script>
import stringmixin from "../mixins/stringpad.mixin";
import { format } from "date-fns";

export default {
  name: "last-month",
  mixins: [stringmixin],
  props: {
    lastMonth: {
      type: Object,
      default: () => {
        return {};
      },
    },
    city: String,
  },

  computed: {
    summaryTitle() {
      return `Weather Statistics for ${this.lastMonth.month || ""}`;
    },

    tableHeader() {
      return `&nbsp;${this.padString(this.city, 11, false)}&nbsp;This Year&nbsp;&nbsp;Normal`;
    },

    averageHighData() {
      return `${this.padString("Average High", 15, false)}${this.padString(
        this.lastMonth?.actual?.averageHigh || "N/A",
        5,
        true
      )}&nbsp;&nbsp;&nbsp;&nbsp;${this.padString(this.lastMonth?.normal?.normalHigh || "N/A", 5, true)}`;
    },

    averageLowData() {
      return `${this.padString("Average Low", 15, false)}${this.padString(
        this.lastMonth?.actual?.averageLow || "N/A",
        5,
        true
      )}&nbsp;&nbsp;&nbsp;&nbsp;${this.padString(this.lastMonth?.normal?.normalLow || "N/A", 5, true)}`;
    },

    precipData() {
      // TODO: handle is winter
      return `${this.padString("Precip (MM)", 15, false)}${this.padString(
        this.lastMonth?.actual?.totalPrecip || "N/A",
        5,
        true
      )}&nbsp;&nbsp;&nbsp;&nbsp;${this.padString(this.lastMonth?.normal?.normalPrecip || "N/A", 5, true)}`;
    },

    warmestDayTemp() {
      const temp = this.lastMonth?.actual?.warmestDay?.temp;
      if (temp === undefined) return null;
      return `${temp > 0 ? "+" : "-"}${temp.toFixed(1)}`;
    },

    warmestTempData() {
      return `${this.padString("Warmest Temp.", 14, false)}${this.padString(
        this.warmestDayTemp || "N/A",
        5,
        true
      )}&nbsp;ON THE ${this.getDateNumberSuffix(this.lastMonth?.actual?.warmestDay?.day)}.`;
    },

    coldestDayTemp() {
      const temp = this.lastMonth?.actual?.coldestDay?.temp;
      if (temp === undefined) return null;
      return `${temp > 0 ? "+" : "-"}${temp.toFixed(1)}`;
    },

    coldestTempData() {
      return `${this.padString("Coldest Temp.", 14, false)}${this.padString(
        this.coldestDayTemp || "N/A",
        5,
        true
      )}&nbsp;ON THE ${this.getDateNumberSuffix(this.lastMonth?.actual?.coldestDay?.day)}`;
    },
  },

  methods: {
    getDateNumberSuffix(number) {
      // this is a really hacky way of getting 1st, 2nd, 3rd, etc..
      number = parseInt(number);
      const date = new Date();
      date.setDate(number);

      return this.padString(format(date, "do"), 4, true);
    },
  },
};
</script>

<style lang="scss" scoped>
#last_month_summary {
  align-items: center;
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
