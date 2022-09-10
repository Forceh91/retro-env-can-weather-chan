<template>
  <div id="conditions_table">
    <div id="conditions_table_content">
      <div id="title" v-html="titleString"></div>
      <div>
        <span>Temp&nbsp;</span><span v-html="padString(temperature, 5, true)"></span>
        <span v-html="padString('', 6)"></span><span>Wind&nbsp;</span><span v-html="wind"></span>
      </div>
      <div>
        <span>Hum&nbsp;&nbsp;</span><span v-html="padString(humidity, 5, true)"></span>
        <span v-html="padString('', 6)"></span><span>{{ currentCondition }}</span>
      </div>
      <div>
        <template v-if="shouldShowExtraData">
          <span>Vsby&nbsp;</span><span v-html="padString(visibility, 6, true)"></span>
          <span v-html="padString('', 5)"></span>
          <span v-if="shouldShowWindchill">Wind Chill {{ windchill }}</span>
          <span v-if="shouldShowAQHI">Air Quality {{ aqhiSummary }}</span>
        </template>
        <template v-else>
          <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visibility&nbsp;&nbsp;</span><span v-html="visibility"></span>
        </template>
      </div>
      <div v-if="showPressure">
        <span v-html="padString('pressure', 11, true)"></span>&nbsp;<span v-html="pressure"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { calculateWindChillNumber } from "../js/windChill";
import conditionmixin from "../mixins/condition.mixin";
import observedmixin from "../mixins/observed.mixin";
import stringpadmixin from "../mixins/stringpad.mixin";

export default {
  name: "Conditions",
  props: {
    city: String,
    observed: Object,
    conditions: Object,
    airQuality: Object,
    showPressure: {
      type: Boolean,
      default: true,
    },
  },

  mixins: [stringpadmixin, conditionmixin, observedmixin],

  computed: {
    titleString() {
      return `&nbsp;${this.city}&nbsp;&nbsp;&nbsp;${this.observedFormatted}`;
    },

    observedFormatted() {
      return this.formatObservedLong(this.observed, true);
    },

    currentCondition() {
      return this.truncateConditions(this.conditions?.condition);
    },

    temperature() {
      let temp = this.conditions?.temperature?.value;
      if (!isNaN(temp)) temp = Math.round(temp);
      else temp = "N/A";

      return `${temp} ${(this.conditions.temperature && this.conditions.temperature.units) || ""}`;
    },

    wind() {
      const wind = this.conditions.wind;
      if (!wind) return "";

      const speed = (wind.speed && wind.speed.value) || "";
      const gust = (wind.gust && wind.gust.value) || 0;
      const direction = wind.direction;
      if (gust) return `${this.padString(direction, 3, true)}&nbsp;&nbsp;${speed}G${gust}&nbsp;`;
      return `${this.padString(direction, 3, true)}&nbsp;&nbsp;${speed} KMH`;
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

    shouldShowWindchill() {
      return this.windchill > 0;
    },

    aqhiSummary() {
      return this.shouldShowAQHI && this.airQuality?.summary;
    },

    shouldShowAQHI() {
      return (!this.shouldShowWindchill && this.airQuality) || false;
    },

    shouldShowExtraData() {
      return this.shouldShowWindchill || this.shouldShowAQHI || false;
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
