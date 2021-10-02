<template>
  <div id="mb_high_low_screen">
    <div v-html="topLine"></div>
    <div v-html="bottomLine"></div>
    <ul id="city_list">
      <li v-for="(cityObj, ix) in sortedHighsLows" :key="`mb.city.${ix}`">
        <span v-html="padString(cityObj.city, 10)"></span>
        <span v-html="`${padString(cityObj.val, 6, true)}`"></span>
        <span><span v-html="padString(`N/A`, 11, true)"></span>&nbsp;&nbsp;&nbsp;</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { EventBus } from "../js/EventBus";

export default {
  name: "mbhighlow",
  props: {
    enabled: Boolean,
    data: Object,
    tempclass: String,
    timezone: String,
  },

  computed: {
    sortedHighsLows() {
      return this.data && [...this.data].sort((a, b) => a.city > b.city);
    },

    timeOfDay() {
      return this.tempclass === "low" ? "Overnight" : "Today:";
    },

    tempClass() {
      return this.tempclass === "low" ? `${this.tempclass}:` : this.tempclass;
    },

    topLine() {
      return (
        (this.tempclass === "low"
          ? this.padString(this.timeOfDay, 17, true)
          : this.padString(this.tempClass, 17, true)) + this.topPrecipLine
      );
    },

    topPrecipLine() {
      return "&nbsp;&nbsp;&nbsp;24-Hr Precip";
    },

    bottomLine() {
      return (
        (this.tempclass !== "low"
          ? this.padString(this.timeOfDay, 17, true)
          : this.padString(this.tempClass, 17, true)) + this.bottomPrecipLine
      );
    },

    bottomPrecipLine() {
      return `&nbsp;&nbsp;&nbsp;To 7 AM ${this.timezone}`;
    },
  },

  mounted() {
    this.checkScreenIsEnabled();
  },

  methods: {
    checkScreenIsEnabled() {
      if (!this.enabled || !this.data || !this.data.length) EventBus.emit("mbhighlow-complete");
    },

    padString(val, minLength, isFront) {
      if (!val) return "";

      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },
  },
};
</script>

<style lang="scss" scoped>
#mb_high_low_screen {
  width: calc(100% - 120px);
}

#city_list {
  margin: 0;
  list-style: none;
}
</style>
