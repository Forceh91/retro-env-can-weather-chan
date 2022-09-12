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
          <span v-if="shouldShowWindchill">Wind Chill {{ ecWindchill }}</span>
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
import { mapGetters } from "vuex";
import conditionmixin from "../mixins/condition.mixin";
import observedmixin from "../mixins/observed.mixin";
import stringpadmixin from "../mixins/stringpad.mixin";

export default {
  name: "Conditions",
  props: {
    showPressure: {
      type: Boolean,
      default: true,
    },
  },

  mixins: [stringpadmixin, conditionmixin, observedmixin],

  computed: {
    ...mapGetters(["ecCity", "ecObservedAtStation", "ecConditions", "ecWindchill"]),

    titleString() {
      return `&nbsp;${this.ecCity}&nbsp;&nbsp;&nbsp;${this.observedFormatted}`;
    },

    observedFormatted() {
      return this.formatObservedLong(this.ecObservedAtStation, true);
    },

    currentCondition() {
      return this.truncateConditions(this.ecConditions?.condition);
    },

    temperature() {
      let temp = this.ecConditions?.temperature?.value;
      if (!isNaN(temp)) temp = Math.round(temp);
      else temp = "N/A";

      return `${temp} ${(this.ecConditions.temperature && this.ecConditions.temperature.units) || ""}`;
    },

    wind() {
      const wind = this.ecConditions.wind;
      if (!wind) return "";

      const speed = (wind.speed && wind.speed.value) || "";
      const gust = (wind.gust && wind.gust.value) || 0;
      const direction = wind.direction;
      if (gust) return `${this.padString(direction, 3, true)}&nbsp;&nbsp;${speed}G${gust}&nbsp;`;
      return `${this.padString(direction, 3, true)}&nbsp;&nbsp;${speed} KMH`;
    },

    humidity() {
      const humidity = this.ecConditions.relativeHumidity;
      if (!humidity) return "";

      return `${humidity.value} ${humidity.units}`;
    },

    visibility() {
      const visibility = this.ecConditions.visibility;
      if (!visibility) return "";

      return `${Math.round(visibility.value)} ${visibility.units}`;
    },

    pressure() {
      const pressure = this.ecConditions.pressure;
      if (!pressure) return "";

      return `${pressure.value} ${pressure.units}&nbsp;&nbsp;${pressure.tendency}`;
    },

    shouldShowWindchill() {
      return this.ecWindchill > 0;
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
