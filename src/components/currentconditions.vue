<template>
  <div id="current_conditions">
    <div v-if="!conditions" id="no_data">Current conditions temporarily unavailable</div>
    <template v-else>
      <div id="conditions_table">
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

          <!-- pressure -->
          <div class="full-width centre-align">
            <span class="label">Pressure {{ pressure }}</span>
          </div>
        </div>
        <div id="rise_set">
          <div class="full-width centre-align">
            <span class="label">{{ sunriseset }}</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { parseISO, format } from "date-fns";

export default {
  name: "CurrentConditions",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    riseset: Object,
  },

  computed: {
    observedFormatted() {
      return format(parseISO(this.observed), "h aa zzz MMM dd/yy");
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

    pressure() {
      const pressure = this.conditions.pressure;
      if (!pressure) return "";

      return `${pressure.value} ${pressure.units} ${pressure.tendency}`;
    },

    sunriseset() {
      const riseSet = this.riseset;
      if (!riseSet) return "";

      const rise = riseSet.dateTime[1];
      const set = riseSet.dateTime[3];

      return `Sunrise ${rise?.hour}:${rise?.minute} AM...Sunset ${set?.hour}:${set?.minute} PM`;
    },
  },

  mounted() {},
};
</script>

<style lang="scss" scoped>
#current_conditions {
  width: calc(100% - 60px);
}

#conditions_table {
  display: flex;
  flex-direction: column;

  #title {
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
    margin-right: 40px;
  }

  span:not(.label) {
    text-align: right;
  }

  #rise_set {
    margin-top: auto;
  }
}
</style>
