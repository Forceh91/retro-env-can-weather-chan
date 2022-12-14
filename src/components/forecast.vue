<template>
  <div id="forecast" :class="{ 'reload-animation': reload }">
    <div v-if="forecastUnavailable" id="no_data">Forecast temporarily unavailable</div>
    <template v-else>
      <template v-if="!page">
        <conditions :show-pressure="false" />
        <div id="next_forecast" class="full-width reloadable reloadable-8">
          <span class="label"
            >Forecast for {{ prettifyForecastDay(forecast[0]?.day) }}..<span>{{
              truncateForecastText(forecast[0]?.textSummary, true)
            }}</span></span
          >
        </div>
      </template>
      <template v-else>
        <div id="forecast_cont">
          <div id="title">{{ ecCity }} Forecast Cont..</div>
          <br />
          <div class="page_forecast">
            <span class="label"
              >{{ forecast[page]?.day }}..<span>{{
                truncateForecastText(forecast[page]?.textSummary, true)
              }}</span></span
            >
          </div>
          <br />
          <div class="page_forecast">
            <span v-if="page + 1 <= forecast.length - 1" class="label"
              >{{ forecast[page + 1]?.day }}..<span>{{
                truncateForecastText(forecast[page + 1]?.textSummary, true)
              }}</span></span
            >
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
const PAGE_CHANGE_FREQUENCY = 15 * 1000;
const LONG_PAGE_CHANGE_FREQUENCY = 50 * 1000;

import { mapGetters } from "vuex";
import { EventBus } from "../js/EventBus";
import forecastmixin from "../mixins/forecast.mixin";
import conditions from "./conditions.vue";

export default {
  name: "Forecast",
  props: {
    forecast: Array,
    reload: Boolean,
  },

  components: { conditions },

  mixins: [forecastmixin],

  data() {
    return { page: 0, pageChangeInterval: null, longPageChangeTimeout: null };
  },

  computed: {
    ...mapGetters(["ecCity"]),

    forecastUnavailable() {
      return !this.forecast || !this.forecast.length;
    },
  },

  watch: {
    reload() {
      if (this.reload) this.generateForecastPages(true);
    },
  },

  mounted() {
    this.generateForecastPages(this.reload);
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
    clearTimeout(this.longPageChangeTimeout);
  },

  methods: {
    generateForecastPages(wasReload) {
      const setupPageChangeInterval = () => {
        this.pageChangeInterval = setInterval(() => {
          this.changePage();
        }, PAGE_CHANGE_FREQUENCY);
      };

      if (this.pageChangeInterval) clearInterval(this.pageChangeInterval);
      if (this.longPageChangeTimeout) clearTimeout(this.longPageChangeTimeout);
      this.page = 0;

      // if we reloaded then linger for 50s before the first change
      if (wasReload) {
        this.longPageChangeTimeout = setTimeout(() => {
          this.changePage();
          setupPageChangeInterval();
        }, LONG_PAGE_CHANGE_FREQUENCY);
      } else setupPageChangeInterval();
    },

    changePage() {
      this.page = ++this.page % (this.forecast?.length - 1);

      if (!this.page || this.forecastUnavailable) EventBus.emit("forecast-complete");
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

#next_forecast {
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss">
@keyframes reloadscreen {
  to {
    visibility: visible;
  }
}

#forecast.reload-animation {
  .reloadable {
    visibility: hidden;
    animation: reloadscreen 222ms forwards;

    &.reloadable-1 {
      animation-delay: 222ms;
    }

    &.reloadable-2 {
      animation-delay: 444ms;
    }

    &.reloadable-3 {
      animation-delay: 666ms;
    }

    &.reloadable-4 {
      animation-delay: 888ms;
    }

    &.reloadable-5 {
      animation-delay: 1100ms;
    }

    &.reloadable-6 {
      animation-delay: 1332ms;
    }

    &.reloadable-7 {
      animation-delay: 1554ms;
    }

    &.reloadable-8 {
      animation-delay: 1776ms;
    }

    &.reloadable-9 {
      animation-delay: 1998ms;
    }
  }
}
</style>
