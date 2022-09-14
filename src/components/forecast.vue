<template>
  <div id="forecast" :class="{ 'reload-animation': reload }">
    <div v-if="forecastUnavailable" id="no_data">Forecast temporarily unavailable</div>
    <template v-else>
      <template v-if="!page">
        <conditions :show-pressure="false" />
        <div id="next_forecast" class="full-width reloadable reloadable-8">
          <span class="label"
            >Forecast for {{ prettifyForecastDay(forecast[0]?.day) }}..<span>{{ forecast[0]?.textSummary }}</span></span
          >
        </div>
      </template>
      <template v-else>
        <div id="forecast_cont">
          <div id="title">{{ ecCity }} Forecast Cont..</div>
          <br />
          <div class="page_forecast">
            <span class="label"
              >{{ forecast[page]?.day }}..<span>{{ forecast[page]?.textSummary }}</span></span
            >
          </div>
          <br />
          <div class="page_forecast">
            <span v-if="page + 1 <= forecast.length - 1" class="label"
              >{{ forecast[page + 1]?.day }}..<span>{{ forecast[page + 1]?.textSummary }}</span></span
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
import { mapGetters } from "vuex";

export default {
  name: "Forecast",
  props: {
    forecast: Array,
    reload: Boolean,
  },

  components: { conditions },

  data() {
    return { page: 0, pageChangeInterval: null };
  },

  computed: {
    ...mapGetters(["ecCity"]),

    forecastUnavailable() {
      return !this.forecast || !this.forecast.length;
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
