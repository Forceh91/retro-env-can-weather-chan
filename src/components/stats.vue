<template>
  <div id="current_conditions">
    <div v-if="!riseSet || !conditions" id="no_data">Stats temporarily unavailable</div>
    <template v-else>
      <div id="conditions_table">
        <div id="title">
          <span id="city">{{ city }}</span> {{ observed }}
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
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "CurrentConditions",
  props: {
    city: String,
    riseSet: Object,
    conditions: Object,
  },

  computed: {
    observed() {
      const timeData = this.conditions.dateTime[1];
      if (!timeData) return "";
      return `${timeData.month?.name.slice(0, 3)} ${timeData.day?.value}`;
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
  },

  mounted() {},
};
</script>

<style lang="scss" scoped>
#current_conditions {
  width: calc(100% - 60px);
}

#conditions_table {
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
}
</style>
