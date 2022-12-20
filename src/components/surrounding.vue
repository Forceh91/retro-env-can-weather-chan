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
const MIN_STATIONS_TO_DISPLAY = 2;

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
    groupByArea: Boolean,
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

    paginateStationsByCount() {
      const startIndex = Math.max(0, (this.page - 1) * MAX_CITIES_PER_PAGE);
      const endIndex = Math.min(startIndex + MAX_CITIES_PER_PAGE, this.observations?.length);
      return this.observations.slice(startIndex, endIndex);
    },

    paginateStationsByArea() {
      const areaCodeForPage = [...this.areaCodes][this.page - 1];
      const area = (areaCodeForPage && this.areas[areaCodeForPage]) || {};
      const stations = (area.stations || []).slice(0, MAX_CITIES_PER_PAGE);
      return stations;
    },

    paginatedObservations() {
      return !this.groupByArea ? this.paginateStationsByCount : this.paginateStationsByArea;
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1, areaCodes: new Set(), areas: {} };
  },

  mounted() {
    if (this.groupByArea) this.generateAreas();
    this.generateObservationsScreen();
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    generateObservationsScreen() {
      this.page = 0;
      this.pages = this.groupByArea ? this.areaCodes.size : Math.ceil(this.observations?.length / MAX_CITIES_PER_PAGE);

      this.changePage();
      this.pageChangeInterval = setInterval(() => {
        this.changePage();
      }, PAGE_CHANGE_FREQUENCY);
    },

    changePage() {
      this.page = ++this.page % (this.pages + 1);
      if (!this.page || this.observationsUnavailable) return EventBus.emit("observation-complete");

      // check that theres something to show on the page
      if (this.paginatedObservations.length < MIN_STATIONS_TO_DISPLAY) this.changePage();
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

    generateAreas() {
      if (!this.groupByArea || this.observationsUnavailable) return;

      this.observations.reduce((areas, weatherStation) => {
        const { area } = weatherStation;
        if (!area) return areas;

        // create a group if it didnt exist, otherwise just add to the list of stations
        if (!this.areaCodes.has(area)) {
          this.addAreaToGroup(area);

          this.areas[area] = { area, stations: [weatherStation] };
        } else {
          const stationsInArea = this.areas[area];
          stationsInArea && stationsInArea.stations.push(weatherStation);
        }

        return areas;
      }, this.areas);
    },

    addAreaToGroup(areaCode) {
      this.areaCodes.add(areaCode);
    },
  },
};
</script>

<style lang="scss" scoped>
#title {
  margin-top: -10px;
}
</style>
