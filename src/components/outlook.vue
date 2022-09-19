<template>
  <div id="outlook">
    <div v-if="outlookUnavailable" id="no_data">Outlook temporarily unavailable</div>
    <template v-else>
      <div id="title">&nbsp;{{ titleString }}</div>
      <ol>
        <li v-for="(outlook, ix) in generatedOutlook" :key="`outlook.${ix}`">
          <span
            >{{ padString(outlook.day, longestDayInOutlook, false, ".") }}..{{ outlook.low }}&nbsp;&nbsp;{{
              outlook.high
            }}</span
          >
          <br />
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{{ outlook.condition }}.</span>
        </li>
        <li>
          <span>{{ normalLowString }}&nbsp;{{ normalHighString }}</span>
        </li>
      </ol>
    </template>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { format } from "date-fns";

import observedmixin from "../mixins/observed.mixin";
import stringpadmixin from "../mixins/stringpad.mixin";

export default {
  name: "outlook-screen",
  mixins: [stringpadmixin, observedmixin],
  props: {
    forecast: Array,
    normals: Object,
  },

  data() {
    return {
      generatedOutlook: [],
    };
  },

  computed: {
    ...mapGetters(["ecObservedAtStation", "ecCity"]),

    titleString() {
      return `Outlook for Southern Manitoba`;
    },

    outlookUnavailable() {
      return !this.forecast || !this.forecast.length || !this.generatedOutlook || !this.generatedOutlook.length;
    },

    longestDayInOutlook() {
      if (this.outlookUnavailable) return 0;

      return Math.max(...this.generatedOutlook.map((go) => go.day.length || 0));
    },

    normalLowString() {
      const [normalLow] = this.normals?.textSummary?.split(".");
      return `Normal ${normalLow}.`;
    },

    normalHighString() {
      const [, normalHigh] = this.normals?.textSummary?.split(".");
      return `Normal${normalHigh}.`;
    },
  },

  mounted() {
    this.get3To5DayOutlook();
  },

  methods: {
    get3To5DayOutlook() {
      if (!this.forecast) return;

      // figure out what 3 days from now is
      const threeDaysAway = this.getDaysAheadFromObserved(this.ecObservedAtStation, 3);
      const threeDaysAwayName = format(threeDaysAway, "EEEE");

      // we need to get day 3, 4, and 5 from the forecast. however we know that the forecast includes "night" forecasts too
      // first thing is to find the index in the forecast that is for threeDaysAway
      const startIx = this.forecast.findIndex((f) => f.day === threeDaysAwayName.toLocaleLowerCase());
      if (startIx === -1) return;

      // now we can build up a forecast for each day
      const outlookForEachDay = [];
      for (let dayNum = 1, dayIx = startIx; dayNum <= 3; dayNum++) {
        const forecastDay = this.forecast[dayIx++];
        const forecastNight = this.forecast[dayIx++];
        const day = forecastDay.day;
        const high = forecastDay?.temperatures?.textSummary || "";
        const low = forecastNight?.temperatures?.textSummary || "";
        const condition = forecastDay?.abbreviatedForecast?.textSummary || "";

        outlookForEachDay.push({ day, high, low, condition });
      }

      // and store it for display
      this.generatedOutlook.splice(0, this.generatedOutlook.length, ...outlookForEachDay);
    },
  },
};
</script>

<style lang="scss" scoped>
#outlook {
  ol,
  li {
    padding: 0;
    margin: 0;
    list-style: none;
  }
}
</style>
