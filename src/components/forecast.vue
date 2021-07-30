<template>
  <div id="forecast">
    <div v-if="forecastUnavailable" id="no_data">Forecast temporarily unavailable</div>
    <template v-else>
      <div id="conditions_table">
        <template v-if="!page">
          <div id="title">
            <span id="city">{{ city }}</span> {{ observedFormatted }}
          </div>
          <div id="conditions_table_content">
            <!-- temp/wind -->
            <div class="half-width">
              <span class="label">Temp</span>
              <span>{{ temperature }}</span>
            </div>
            <div class="half-width">
              <span class="label">Wind</span>
              <span>{{ wind }}</span>
            </div>

            <!-- hum/condition -->
            <div class="half-width">
              <span class="label">Hum&nbsp;</span>
              <span>{{ humidity }}</span>
            </div>
            <div class="half-width">
              <span class="label">{{ conditions.condition }}</span>
            </div>

            <!-- vsby/chill -->
            <div class="half-width">
              <span class="label">VSBY</span>
              <span>{{ visibility }}</span>
            </div>

            <div id="next_forecast" class="full-width">
              <span class="label"
                >Forecast for {{ forecast[0]?.day }}..<span>{{ forecast[0]?.textSummary }}</span></span
              >
            </div>
          </div>
        </template>
        <template v-else>
          <div id="title" class="secondary">
            <span id="city">{{ city }} Forecast Cont..</span>
          </div>
          <div id="conditions_table_content">
            <div class="page_forecast">
              <span class="label"
                >Forecast for {{ forecast[page]?.day }}..<span>{{ forecast[page]?.textSummary }}</span></span
              >
            </div>
            <div class="page_forecast">
              <span v-if="page + 1 <= forecast.length - 1" class="label"
                >Forecast for {{ forecast[page + 1]?.day }}..<span>{{ forecast[page + 1]?.textSummary }}</span></span
              >
            </div>
          </div>
        </template>
      </div>
    </template>
  </div>
</template>

<script>
const PAGE_CHANGE_FREQUENCY = 15 * 1000;

import { parseISO, format } from "date-fns";
import { EventBus } from "../js/EventBus";

export default {
  name: "Forecast",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    forecast: Array,
  },

  data() {
    return { page: 0, pageChangeInterval: null };
  },

  computed: {
    forecastUnavailable() {
      return !this.conditions || !this.forecast;
    },

    observedFormatted() {
      return format(parseISO(this.observed), "h aa ??? MMM dd/yy").replace(`???`, this.conditions?.dateTime[1]?.zone);
    },

    temperature() {
      return (
        ((this.conditions.temperature && this.conditions.temperature.value) || "N/A") +
          " " +
          this.conditions.temperature.units || ""
      );
    },

    wind() {
      const wind = this.conditions.wind;
      if (!wind) return "";

      const speed = (wind.speed && wind.speed.value) || "";
      const direction = wind.direction;
      const units = wind.speed && wind.speed.units;
      return `${direction} ${speed} ${units}`;
    },

    humidity() {
      const humidity = this.conditions.relativeHumidity;
      if (!humidity) return "";

      return `${humidity.value} ${humidity.units}`;
    },

    visibility() {
      const visibility = this.conditions.visibility;
      if (!visibility) return "";

      return `${visibility.value} ${visibility.units}`;
    },
  },

  mounted() {
    this.page = 0;

    this.pageChangeInterval = setInterval(() => {
      if (!this.page) this.page = ++this.page % this.forecast?.length;
      else this.page = (this.page + 2) % this.forecast?.length;

      if (!this.page || this.forecastUnavailable) return EventBus.emit("forecast-complete");
    }, PAGE_CHANGE_FREQUENCY);
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },
};
</script>

<style lang="scss" scoped>
#forecast {
  width: calc(100% - 60px);
}

#conditions_table {
  display: flex;
  flex-direction: column;
  height: 100%;

  #title {
    &.secondary {
      margin: 0;
      margin-top: 30px;
    }

    #city {
      margin-right: 50px;
    }

    text-align: center;
  }

  div {
    &:not(:last-child) {
      margin-bottom: 10px;
    }

    &.half-width {
      display: inline-block;
      width: 50%;
    }

    &.full-width {
      &.centre-align {
        text-align: center;
      }
      width: 100%;
    }
  }

  .label {
    &:not(:only-child) {
      margin-right: 40px;
    }
  }

  span:not(.label) {
    text-align: right;
  }

  #next_forecast {
    margin-top: 15px;
  }

  .page_forecast {
    margin-top: 30px;
    width: 100%;
  }
}
</style>
