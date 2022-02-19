<template>
  <div id="forecast">
    <div v-if="forecastUnavailable" id="no_data">Forecast temporarily unavailable</div>
    <template v-else>
      <template v-if="!page">
        <conditions :city="city" :observed="observed" :conditions="conditions" />
        <br />
        <div id="next_forecast" class="full-width">
          <span class="label"
            >Forecast for {{ prettifyForecastDay(forecast[0]?.day) }}..<span>{{ forecast[0]?.textSummary }}</span></span
          >
        </div>
      </template>
      <template v-else>
        <div id="forecast_cont">
          <div id="title">{{ city }} Forecast Cont..</div>
          <br /><br />
          <div class="page_forecast">
            <span class="label"
              >Forecast for {{ forecast[page]?.day }}..<span>{{ forecast[page]?.textSummary }}</span></span
            >
          </div>
          <br /><br />
          <div class="page_forecast">
            <span v-if="page + 1 <= forecast.length - 1" class="label"
              >Forecast for {{ forecast[page + 1]?.day }}..<span>{{ forecast[page + 1]?.textSummary }}</span></span
            >
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
const PAGE_CHANGE_FREQUENCY = 15 * 1000;

import conditions from "./conditions.vue";
import { EventBus } from "../js/EventBus";

export default {
  name: "Forecast",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    forecast: Array,
  },

  components: { conditions },

  data() {
    return { page: 0, pageChangeInterval: null };
  },

  computed: {
    forecastUnavailable() {
      return !this.conditions || !this.forecast;
    },
  },

  mounted() {
    this.generateForecastPages();
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    generateForecastPages() {
      this.page = 0;

      this.pageChangeInterval = setInterval(() => {
        this.changePage();
      }, PAGE_CHANGE_FREQUENCY);
    },

    changePage() {
      if (!this.page) this.page = ++this.page % this.forecast?.length;
      else this.page = (this.page + 2) % this.forecast?.length;

      if (!this.page || this.forecastUnavailable) return EventBus.emit("forecast-complete");
    },

    prettifyForecastDay(val) {
      val = (val || "").toLowerCase();
      return val.includes("night") ? "Tonight" : "Today";
    },
  },
};
</script>

<style lang="scss" scoped>
#forecast {
  overflow: hidden;
  width: calc(100% - 60px);
}

#forecast_cont #title {
  text-align: center;
}
</style>
