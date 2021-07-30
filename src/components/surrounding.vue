<template>
  <div id="surrounding">
    <div id="title">{{ dateTime }}</div>
    <div v-if="!observations || !observations.length">No observations available</div>
    <div v-else id="observation_table">
      <div v-for="(observation, ix) in paginatedObservations" :key="`observation.${ix}`">
        <span v-html="padTitle(observation.city)"></span><span>{{ observation.observation.temp }}</span
        >&nbsp;&nbsp;<span>{{ observation.observation.condition?.slice(0, 13) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
const MAX_TITLE_LENGTH = 11;
const MAX_CITIES_PER_PAGE = 8;
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
      value: () => [],
    },
  },

  computed: {
    dateTime() {
      return this.observed ? format(parseISO(this.observed), "h aa ??? MMM dd/yy").replace(`???`, this.timezone) : "";
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
      const startIndex = Math.max(0, (this.page - 1) * MAX_CITIES_PER_PAGE - 1);
      const endIndex = Math.min(startIndex + MAX_CITIES_PER_PAGE - 1, this.observations?.length);
      return this.sortedObservations.slice(startIndex, endIndex);
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1 };
  },

  mounted() {
    this.page = 1;
    this.pages = Math.ceil(this.observations?.length / MAX_CITIES_PER_PAGE);

    this.pageChangeInterval = setInterval(() => {
      this.page = ++this.page % (this.pages + 1);
      if (!this.page) return EventBus.emit("observation-complete");
    }, PAGE_CHANGE_FREQUENCY);
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    padTitle(val) {
      const slicedTitle = val.slice(0, MAX_TITLE_LENGTH);
      const paddingToAdd = MAX_TITLE_LENGTH - slicedTitle.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += `&nbsp`;

      return `${slicedTitle}${paddingString}&nbsp;&nbsp;&nbsp;`;
    },
  },
};
</script>

<style lang="scss" scoped>
#title {
  margin-bottom: 30px;
  text-align: center;
}
</style>
