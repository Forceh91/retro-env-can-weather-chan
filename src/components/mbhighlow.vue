<template>
  <div id="mb_high_low_screen">
    <div v-html="topLine"></div>
    <div v-html="bottomLine"></div>
    <ul id="city_list">
      <li v-for="(station, ix) in weatherStations" :key="`mb.city.${ix}`">
        <span v-html="padString(station.name, 10)"></span>
        <span v-html="`${padString(station.display_temp, 6, true)}`"></span>
        <span v-html="padString('&nbsp;', 6, true)"></span>
        <span v-html="generatePrecipString(station.yesterday_precip)" class="precip-amount"></span>
      </li>
    </ul>
  </div>
</template>

<script>
import { format, subDays } from "date-fns";
import { EventBus } from "../js/EventBus";

export default {
  name: "mbhighlow",
  props: {
    enabled: Boolean,
    timezone: String,
    manitobaData: {
      type: Object,
      default: () => {
        return null;
      },
    },
  },

  computed: {
    period() {
      return this.manitobaData?.period;
    },

    weatherStations() {
      return this.manitobaData?.stations || [];
    },

    timeOfDay() {
      return this.period === "min_temp" ? "Overnight" : "Today:";
    },

    yesterday() {
      return subDays(new Date(), 1);
    },

    yesterdayDateFormatted() {
      return format(this.yesterday, "MMM dd");
    },

    tempClass() {
      return this.period === "min_temp" ? `Low:` : `High`;
    },

    topLine() {
      return (
        (this.period === "min_temp"
          ? this.padString(this.timeOfDay, 17, true)
          : this.padString(this.tempClass, 17, true)) + this.topPrecipLine
      );
    },

    topPrecipLine() {
      return "&nbsp;&nbsp;&nbsp;24-Hr Precip";
    },

    bottomLine() {
      return (
        (this.period !== "min_temp"
          ? this.padString(this.timeOfDay, 17, true)
          : this.padString(this.tempClass, 17, true)) + this.bottomPrecipLine
      );
    },

    bottomPrecipLine() {
      return `&nbsp;&nbsp;&nbsp;&nbsp;For ${this.yesterdayDateFormatted}`;
    },
  },

  mounted() {
    this.checkScreenIsEnabled();
  },

  methods: {
    checkScreenIsEnabled() {
      console.log("weather stations", this.weatherStations.length);
      if (!this.enabled || !this.manitobaData || !this.weatherStations || !this.weatherStations.length) {
        console.log("emitting");
        EventBus.emit("mbhighlow-complete");
      }
    },

    padString(val, minLength, isFront) {
      if (!val) val = "N/A";

      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },

    generatePrecipString(precipData) {
      // show missing if theres no data to look at
      if (!precipData) return "MISSING";

      // if its not a number if may be already be MISSING or TRACE
      if (isNaN(precipData?.value) || !(precipData?.value || "").length) return precipData?.value || "MISSING";

      const precipValue = parseFloat(precipData?.value).toFixed(1);

      // if its 0.0 show that without unit
      if (precipValue < 0.1) return this.padString(`NIL`, 6, true);

      // if its less than 0.2, show trace
      if (precipValue < 0.2) return this.padString(`TRACE`, 7, true);

      // otherwise show correct data
      return this.padString(`${precipValue} ${precipData?.units}`, 8, true);
    },
  },
};
</script>

<style lang="scss" scoped>
#city_list {
  margin: 0;
  list-style: none;

  li {
    display: flex;
  }
}
</style>
