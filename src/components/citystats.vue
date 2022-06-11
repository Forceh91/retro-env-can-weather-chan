<template>
  <div id="city_stats">
    <div id="title">{{ titleString }}</div>
    <div id="rise_set">{{ sunriseset }}</div>
    <!-- normally precip data goes here -->
    <div>&nbsp;</div>
    <div>&nbsp;</div>
    <div>&nbsp;</div>
    <div id="hot_cold_title">{{ hotColdTitleString }}</div>
    <div id="hot_spot" v-html="hotSpotString"></div>
    <div id="cold_spot" v-html="coldSpotString"></div>
  </div>
</template>

<script>
const HOT_COLD_SPOT_MAX_LENGTH = 31;
import { format } from "date-fns";
// import { EventBus } from "../js/EventBus";

export default {
  name: "city-stats",
  props: {
    city: String,
    riseset: Object,
    hotcold: Object,
  },

  computed: {
    currentDate() {
      return format(new Date().getTime(), "MMM dd");
    },

    sunriseset() {
      const riseSet = this.riseset;
      if (!riseSet) return "";

      const rise = riseSet.dateTime[1];
      const set = riseSet.dateTime[3];

      return `Sunrise..${rise?.hour}:${rise?.minute} AM Sunset..${this.pad(set?.hour % 12)}:${set?.minute} PM`;
    },

    titleString() {
      return `${this.city} Statistics - ${this.currentDate}`;
    },

    hotColdTitleString() {
      return `Canadian Hot/Cold Spot ${this.currentDate}`;
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
  },

  methods: {
    pad(val) {
      return val < 10 ? `0${val}` : val;
    },

    padString(val, minLength, isFront, char) {
      char = char || `&nbsp;`;
      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += char;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
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
