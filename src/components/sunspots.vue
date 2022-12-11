<template>
  <div>
    <div><span v-html="dateString"></span><span>Sunspot Weather&nbsp;&nbsp;</span><span>Hi/Lo</span></div>
    <div v-for="sunspotCity in availableStations" :key="`sunspot.${sunspotCity.stationCode}`">
      <span v-html="padCityName(sunspotCity.name)"></span>
      <span v-html="truncateForecastCondition(sunspotCity.forecastText)"></span>
      <span>{{ sunspotCity.hiTemp }}/</span><span v-html="padLoTemp(sunspotCity.loTemp)"></span>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { EventBus } from "../js/EventBus";
import observedmixin from "../mixins/observed.mixin";
import conditonsmixin from "../mixins/condition.mixin";
import stringpadmixin from "../mixins/stringpad.mixin";

export default {
  name: "sunspots",
  mixins: [observedmixin, conditonsmixin, stringpadmixin],
  props: {
    sunspotForecast: Array,
  },

  computed: {
    ...mapGetters(["ecObservedAtStation"]),

    availableStations() {
      return (
        this.sunspotForecast &&
        this.sunspotForecast.filter(
          (sunspotCity) =>
            sunspotCity.forecastText && sunspotCity.hiTemp !== Math.min() && sunspotCity.loTemp !== Math.max()
        )
      );
    },

    sunspotForecastUnavailable() {
      return !this.sunspotForecast || !this.sunspotForecast.length || this.availableStations.length < 2;
    },

    dateString() {
      return this.padString(this.formatSunspotDate(this.ecObservedAtStation), 9);
    },
  },

  mounted() {
    this.checkSunspotForecastIsAvailable();
  },

  methods: {
    checkSunspotForecastIsAvailable() {
      if (this.sunspotForecastUnavailable) EventBus.emit("sunspots-complete");
    },

    padCityName(cityName) {
      return this.padString(cityName, 13);
    },

    padLoTemp(temp) {
      return this.padString(temp, 2, true, "0");
    },

    truncateForecastCondition(forecastCondition) {
      return this.padString(this.harshTruncateConditions(forecastCondition, 12), 13);
    },
  },
};
</script>

<style lang="scss" scoped></style>
