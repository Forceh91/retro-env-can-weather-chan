<template>
  <div id="conditions_table">
    <div id="conditions_table_content">
      <div class="reloadable reloadable-1" id="title" v-html="titleString"></div>
      <div>
        <div class="reloadable reloadable-2">
          <span>Temp&nbsp;</span><span v-html="padString(temperature, 5, true)"></span>
        </div>
        <div class="reloadable reloadable-3">
          <span v-html="padString('', 6)"></span><span>Wind&nbsp;</span><span v-html="wind"></span>
        </div>
      </div>
      <div>
        <div class="reloadable reloadable-4">
          <span>Hum&nbsp;&nbsp;</span><span v-html="padString(humidity, 5, true)"></span>
        </div>
        <div class="reloadable reloadable-5">
          <span v-html="padString('', 6)"></span><span>{{ currentCondition }}</span>
        </div>
      </div>
      <div>
        <template v-if="shouldShowExtraData">
          <div class="reloadable reloadable-6">
            <span>Vsby&nbsp;</span><span v-html="padString(visibility, 6, true)"></span>
          </div>
          <span v-html="padString('', 5, true)"></span>
          <div class="reloadable reloadable-7">
            <span v-if="shouldShowWindchill">Wind Chill {{ ecWindchill }}</span>
          </div>
          <div class="reloadable reloadable-7">
            <span v-if="shouldShowAQHI">Air Quality {{ aqhiSummary }}</span>
          </div>
        </template>
        <template v-else>
          <div class="reloadable reloadable-6">
            <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Visibility&nbsp;&nbsp;</span><span v-html="visibility"></span>
          </div>
        </template>
      </div>
      <div v-if="showPressure" class="reloadable">
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
    ...mapGetters(["ecCity", "ecObservedAtStation", "ecConditions", "ecWindchill", "ecAirQuality"]),

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
      if (temp !== null && !isNaN(temp)) temp = Math.round(temp);
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

      return this.padString(`${humidity.value || "N/A"} ${humidity.units}`, 4, true);
    },

    visibility() {
      const visibility = this.ecConditions.visibility;
      if (!visibility) return "";

      const { value, units } = visibility;
      if (!value) return "";

      return `${Math.round(value)} ${units}`;
    },

    pressure() {
      const pressure = this.ecConditions.pressure;
      if (!pressure) return "";

      const { value, units, tendency } = pressure;
      if (!value) return "";

      return `${value} ${units}&nbsp;&nbsp;${tendency}`;
    },

    shouldShowWindchill() {
      return this.ecWindchill > 0;
    },

    aqhiSummary() {
      return this.shouldShowAQHI && this.ecAirQuality?.summary;
    },

    shouldShowAQHI() {
      return (!this.shouldShowWindchill && this.ecAirQuality !== null) || false;
    },

    shouldShowExtraData() {
      return this.shouldShowWindchill || this.shouldShowAQHI || false;
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

  .reloadable {
    display: inline-block;
  }
}
</style>
