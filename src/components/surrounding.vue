<template>
  <div id="surrounding">
    <div id="title" v-html="dateTime"></div>
    <div v-if="observationsUnavailable">No observations available</div>
    <div v-else id="observation_table">
      <div v-for="(observation, ix) in paginatedObservations" :key="`observation.${ix}`">
        <span v-html="padTitle(observation.name)"></span
        ><span v-html="padString(roundTemp(observation.observation.temp), 4, true)"></span>&nbsp;&nbsp;<span
          v-html="padString(trimCondition(observation.observation.condition), 13)"
        ></span>
      </div>
    </div>
  </div>
</template>

<script>
const MAX_TITLE_LENGTH = 13;
const MAX_CITIES_PER_PAGE = 7;
const PAGE_CHANGE_FREQUENCY = 15 * 1000;

import { mapGetters } from "vuex";
import { EventBus } from "../js/EventBus";
import conditionmixin from "../mixins/condition.mixin";
import observedmixin from "../mixins/observed.mixin";

export default {
  name: "Surrounding",
  props: {
    observed: String,
    timezone: String,
    observations: {
      type: Array,
      default: () => [],
    },
  },

  mixins: [conditionmixin, observedmixin],

  computed: {
    ...mapGetters(["ecObservedAtStation"]),

    observationsUnavailable() {
      return !this.observations || !this.observations.length;
    },

    dateTime() {
      if (!this.ecObservedAtStation) return "";

      const padding = this.padString("", 5, true);
      const dateString = this.formatObservedLong(this.ecObservedAtStation, true, "&nbsp;");
      return `${padding} ${dateString}`;
    },

    paginatedObservations() {
      const startIndex = Math.max(0, (this.page - 1) * MAX_CITIES_PER_PAGE);
      const endIndex = Math.min(startIndex + MAX_CITIES_PER_PAGE, this.observations?.length);
      return this.observations.slice(startIndex, endIndex);
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1 };
  },

  mounted() {
    this.generateObservationsScreen();
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    generateObservationsScreen() {
      this.page = 1;
      this.pages = Math.ceil(this.observations?.length / MAX_CITIES_PER_PAGE);

      this.pageChangeInterval = setInterval(() => {
        this.changePage();
      }, PAGE_CHANGE_FREQUENCY);
    },

    changePage() {
      this.page = ++this.page % (this.pages + 1);
      if (!this.page || this.observationsUnavailable) return EventBus.emit("observation-complete");
    },

    padTitle(val) {
      const slicedTitle = val.slice(0, MAX_TITLE_LENGTH);
      const paddingToAdd = MAX_TITLE_LENGTH - slicedTitle.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return `${slicedTitle}${paddingString}`;
    },

    trimCondition(val) {
      return this.harshTruncateConditions(val);
    },

    padString(val, minLength, isFront) {
      if (val === null || val === undefined) val = "";
      val = val.toString();
      if (!val.length) val = "";

      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },

    roundTemp(temp) {
      if (isNaN(temp) || temp === null) return "";
      return Math.round(temp);
    },
  },
};
</script>

<style lang="scss" scoped>
#title {
  margin-top: -10px;
}
</style>
