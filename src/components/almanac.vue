<template>
  <div id="almanac">
    <div v-if="almanacUnavailable" id="no_data">Almanac temporarily unavailable</div>
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
          <div v-if="windchill > 0" class="half-width">
            <span class="label">Wind Chill</span>
            <span>{{ windchill }}</span>
          </div>

          <!-- pressure -->
          <div class="full-width centre-align spaced">
            <span class="label">Pressure {{ pressure }}</span>
          </div>

          <!-- almanac data -->
          <div id="almanac_table">
            <div class="header">Last Year&nbsp;Normal&nbsp;Records&nbsp;&nbsp;Year</div>
            <div id="almanac_hi">
              Hi <span v-html="highLastYear"></span>&nbsp;&nbsp;<span v-html="highNormal"></span>&nbsp;&nbsp;<span
                v-html="recordHigh"
              ></span
              >&nbsp;IN&nbsp;<span v-html="recordHighYear"></span>
            </div>
            <div id="almanac_lo">
              Lo <span v-html="lowLastYear"></span>&nbsp;&nbsp;<span v-html="lowNormal"></span>&nbsp;&nbsp;<span
                v-html="recordLow"
              ></span
              >&nbsp;IN&nbsp;<span v-html="recordLowYear"></span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { parseISO, format } from "date-fns";
import { calculateWindChillNumber } from "../js/windChill";

export default {
  name: "Almanac",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    almanac: Object,
  },

  data() {
    return {};
  },

  computed: {
    almanacUnavailable() {
      return !this.conditions || !this.almanac;
    },

    observedFormatted() {
      return format(parseISO(this.observed), "h aa ??? MMM dd/yy").replace(`???`, this.conditions?.dateTime[1]?.zone);
    },

    temperature() {
      return (
        ((this.conditions.temperature && parseInt(this.conditions.temperature.value)) || "N/A") +
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

      return `${parseInt(visibility.value)} ${visibility.units}`;
    },

    pressure() {
      const pressure = this.conditions.pressure;
      if (!pressure) return "";

      return `${pressure.value} ${pressure.units} ${pressure.tendency}`;
    },

    highLastYear() {
      return `${this.padString("N/A", 5, true)}`;
    },

    highNormal() {
      const highTemps = this.almanac?.temperature[2];
      return `${this.padString(highTemps?.value, 5, true)}`;
    },

    recordHigh() {
      const recordHigh = this.almanac?.temperature[0];
      return `${this.padString(recordHigh?.value, 5, true)}`;
    },

    recordHighYear() {
      const recordHigh = this.almanac?.temperature[0];
      return `${recordHigh?.year}`;
    },

    lowLastYear() {
      return `${this.padString("N/A", 5, true)}`;
    },

    lowNormal() {
      const lowTemps = this.almanac?.temperature[3];
      return `${this.padString(lowTemps?.value, 5, true)}`;
    },

    recordLow() {
      const recordLow = this.almanac?.temperature[1];
      return `${this.padString(recordLow?.value, 5, true)}`;
    },

    recordLowYear() {
      const recordLow = this.almanac?.temperature[1];
      return `${recordLow?.year}`;
    },

    windchill() {
      const temp = this.conditions.temperature && this.conditions.temperature.value;
      if (temp > 0) return 0;

      const windspeed = this.conditions?.wind?.speed?.value;
      return calculateWindChillNumber(temp, windspeed);
    },
  },

  methods: {
    padString(val, minLength, isFront) {
      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },
  },
};
</script>

<style lang="scss" scoped>
#almanac {
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

  #almanac_table {
    align-items: center;
    display: flex;
    flex-direction: column;
  }
}
</style>
