<template>
  <div id="conditions_table">
    <div id="conditions_table_content">
      <div id="title" v-html="titleString"></div>
      <div>
        <span>Temp&nbsp;</span><span v-html="padString(temperature, 5, true)"></span>
        <span v-html="padString('', 5)"></span><span>Wind&nbsp;</span><span v-html="wind"></span>
      </div>
      <div>
        <span>Hum&nbsp;&nbsp;</span><span v-html="padString(humidity, 5, true)"></span>
        <span v-html="padString('', 5)"></span><span>{{ conditions.condition }}</span>
      </div>
      <div>
        <span>Vsby&nbsp;</span><span v-html="padString(visibility, 6, true)"></span>
        <template v-if="windchill > 0"
          ><span v-html="padString('', 4)"></span><span>Wind Chill {{ windchill }}</span></template
        >
      </div>
      <div><span v-html="padString('pressure', 11, true)"></span>&nbsp;<span v-html="pressure"></span></div>
    </div>
  </div>
</template>

<script>
import { parseISO, format } from "date-fns";
import { calculateWindChillNumber } from "../js/windChill";

export default {
  name: "Conditions",
  props: {
    city: String,
    observed: String,
    conditions: Object,
  },

  computed: {
    titleString() {
      return `&nbsp;${this.city}&nbsp;&nbsp;&nbsp;${this.observedFormatted}`;
    },

    observedFormatted() {
      return format(parseISO(this.observed), "h aa ???'&nbsp;'MMM dd/yy").replace(
        `???`,
        this.conditions?.dateTime[1]?.zone
      );
    },

    temperature() {
      return (
        ((this.conditions.temperature && Math.round(this.conditions.temperature.value)) || "N/A") +
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
      return `${this.padString(direction, 3, true)}&nbsp;&nbsp;${speed} ${units}`;
    },

    humidity() {
      const humidity = this.conditions.relativeHumidity;
      if (!humidity) return "";

      return `${humidity.value} ${humidity.units}`;
    },

    visibility() {
      const visibility = this.conditions.visibility;
      if (!visibility) return "";

      return `${Math.round(visibility.value)} ${visibility.units}`;
    },

    pressure() {
      const pressure = this.conditions.pressure;
      if (!pressure) return "";

      return `${pressure.value} ${pressure.units}&nbsp;&nbsp;${pressure.tendency}`;
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
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },
  },
};
</script>

<style lang="scss" scoped>
#conditions_table {
  display: flex;
  justify-content: center;

  #conditions_table_content div {
    margin-bottom: 5px;
  }
}
</style>
