<template>
  <div id="city_stats">
    <template v-if="cityStatsUnavailable">Stats temporarily unavailable</template>
    <template v-else>
      <div id="title">{{ titleString }}</div>
      <div id="rise_set">{{ sunriseset }}</div>
      <!-- normally precip data goes here -->
      <div id="precip_title">{{ precipTitle }}</div>
      <div id="precip_actual">{{ precipActual }}</div>
      <div id="precip_normal">{{ precipNormal }}</div>
      <div id="hot_cold_title">{{ hotColdTitleString }}</div>
      <div id="hot_spot" v-html="hotSpotString"></div>
      <div id="cold_spot" v-html="coldSpotString"></div>
    </template>
  </div>
</template>

<script>
const HOT_COLD_SPOT_MAX_LENGTH = 31;
const PRECIP_STRING_WITH_DATA_LENGTH = 29;
import { format } from "date-fns";
import stringpadmixin from "../mixins/stringpad.mixin";

// import { EventBus } from "../js/EventBus";

export default {
  name: "city-stats",
  mixins: [stringpadmixin],
  props: {
    city: String,
    riseset: Object,
    hotcold: {
      type: Object,
      default: () => {
        return {};
      },
    },
    seasonPrecip: {
      type: Object,
      default: () => {
        return { precip: {}, isWinter: false };
      },
    },
    isWinter: Boolean,
  },

  computed: {
    cityStatsUnavailable() {
      return !this.city;
    },

    currentDate() {
      return format(new Date().getTime(), "MMM d");
    },

    sunriseset() {
      const riseSet = this.riseset;
      if (!riseSet) return "";

      const rise = riseSet.dateTime[1];
      const set = riseSet.dateTime[3];

      return `Sunrise..${parseInt(rise?.hour)}:${rise?.minute} AM Sunset..${set?.hour % 12}:${set?.minute} PM`;
    },

    titleString() {
      return `${this.city} Statistics - ${this.currentDate}`;
    },

    hotColdTitleString() {
      return `Canadian Hot/Cold Spot - ${this.currentDate}`;
    },

    hotSpotString() {
      return `${this.hotcold?.hot?.city || "N/A"}, ${this.hotcold?.hot?.province || "N/A"}&nbsp;${this.fillEllipsis(
        this.hotcold?.hot
      )}${this.padString((this.hotcold.hot?.temp || "N/A").split(".")[0], 3, true)}`;
    },

    coldSpotString() {
      return `${this.hotcold?.cold?.city || "N/A"}, ${this.hotcold?.cold?.province || "N/A"}&nbsp;${this.fillEllipsis(
        this.hotcold?.cold
      )}${this.padString((this.hotcold.cold?.temp || "N/A").split(".")[0], 3, true)}`;
    },

    precipTitle() {
      return `Total ${this.isWinter ? "Snowfall" : "Precipitation"} Since`;
    },

    precipActual() {
      const totalPrecip = `${this.seasonPrecip.totalPrecip || 0} MM`;
      const dateString = `${this.isWinter ? `October` : `April`} 1st`;

      // how many dots we need here
      const padLength = PRECIP_STRING_WITH_DATA_LENGTH - totalPrecip.length - dateString.length;

      // actual string to return
      return `${dateString}${this.padString(" .", padLength, false, ".")}${totalPrecip}`;
    },

    precipNormal() {
      const normalPrecip = `${this.seasonPrecip.normalPrecip || 0} MM`;
      const dateString = `Normal`;

      // how many dots we need here
      const padLength = PRECIP_STRING_WITH_DATA_LENGTH - normalPrecip.length - dateString.length;

      // actual string to return
      return `${dateString}${this.padString(" .", padLength, false, ".")}${normalPrecip}`;
    },
  },

  methods: {
    pad(val) {
      return val < 10 ? `0${val}` : val;
    },

    fillEllipsis(data) {
      if (!data) return this.padString("", HOT_COLD_SPOT_MAX_LENGTH, true, ".");

      const nameLength = data?.city?.length || 0;
      const provinceLength = data?.province?.length || 0;

      return this.padString("", HOT_COLD_SPOT_MAX_LENGTH - nameLength - provinceLength, true, ".");
    },
  },
};
</script>

<style lang="scss" scoped>
#city_stats {
  align-items: center;
  display: flex;
  font-size: 1.3rem;
  flex-direction: column;
  width: calc(100% - 60px);

  #rise_set {
    text-align: center;
  }
}
</style>
