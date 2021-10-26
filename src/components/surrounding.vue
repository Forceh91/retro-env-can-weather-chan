<template>
  <div id="surrounding">
    <div id="title" v-html="dateTime"></div>
    <div v-if="observationsUnavailable">No observations available</div>
    <div v-else id="observation_table">
      <div v-for="(observation, ix) in paginatedObservations" :key="`observation.${ix}`">
        <span v-html="padTitle(observation.city)"></span
        ><span v-html="padString(roundTemp(observation.observation.temp), 3, true)"></span>&nbsp;&nbsp;<span>{{
          trimCondition(observation.observation.condition)
        }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const MAX_TITLE_LENGTH = 11;
const MAX_CITIES_PER_PAGE = 11;
const PAGE_CHANGE_FREQUENCY = 15 * 1000;

import { format, parseISO } from "date-fns";
import { EventBus } from "../js/EventBus";

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

  computed: {
    observationsUnavailable() {
      return !this.observations || !this.observations.length;
    },

    dateTime() {
      return this.observed
        ? format(parseISO(this.observed), "h aa ???'&nbsp;&nbsp;'MMM dd/yy").replace(`???`, this.timezone)
        : "";
    },

    sortedObservations() {
      return [...this.observations].sort((a, b) => {
        const cityA = a.city.toUpperCase();
        const cityB = b.city.toUpperCase();
        if (cityA < cityB) return -1;
        if (cityA > cityB) return 1;
        return 0;
      });
    },

    paginatedObservations() {
      const startIndex = Math.max(0, (this.page - 1) * MAX_CITIES_PER_PAGE);
      const endIndex = Math.min(startIndex + MAX_CITIES_PER_PAGE, this.observations?.length);
      return this.sortedObservations.slice(startIndex, endIndex);
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

      return `${slicedTitle}${paddingString}&nbsp;&nbsp;&nbsp;`;
    },

    trimCondition(val) {
      const squishedVal = val?.replace(/shower/g, "");
      return squishedVal?.slice(0, 13);
    },

    padString(val, minLength, isFront) {
      if (!val) val = "";
      val = val.toString();
      if (!val.length) val = "";

      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp;`;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },

    roundTemp(temp) {
      if (isNaN(temp)) return "";
      return Math.round(temp);
    },
  },
};
</script>

<style lang="scss" scoped>
#surrounding {
  margin-top: -10px;
}

#title {
  text-align: center;
}

#observation_table {
}
</style>
