<template>
  <div id="almanac">
    <div v-if="almanacUnavailable" id="no_data">Almanac temporarily unavailable</div>
    <template v-else>
      <conditions :city="city" :observed="observed" :conditions="conditions" />

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
    </template>
  </div>
</template>

<script>
import conditions from "./conditions.vue";

export default {
  name: "Almanac",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    almanac: Object,
    lastYear: Object,
  },

  components: { conditions },

  data() {
    return {};
  },

  computed: {
    almanacUnavailable() {
      return !this.conditions || !this.almanac;
    },

    highLastYear() {
      const highLastYear = this.lastYear?.temp?.max || "N/A";
      return `${this.padString(highLastYear, 5, true)}`;
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
      const lowLastYear = this.lastYear?.temp?.min || "N/A";
      return `${this.padString(lowLastYear, 5, true)}`;
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
#almanac {
  width: calc(100% - 60px);
}

#almanac_table {
  align-items: center;
  display: flex;
  flex-direction: column;
}
</style>
