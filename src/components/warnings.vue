<template>
  <div id="warnings">
    <div id="title">* WEATHER WARNINGS *</div>
    <div v-if="warningsUnavailable">No warnings in effect</div>
    <div v-else id="warnings_table">
      <div class="description">{{ warningDescription }}</div>
      <div class="city">In Effect For {{ city }}</div>
    </div>
  </div>
</template>

<script>
const MAX_WARNINGS_PER_PAGE = 3;
// const PAGE_CHANGE_FREQUENCY = 15 * 1000;

import { EventBus } from "../js/EventBus";

export default {
  name: "Warnings",
  props: {
    city: String,
    warnings: {
      type: Object,
      default: () => {},
    },
  },

  computed: {
    warningsUnavailable() {
      return !this.warnings || !this.warnings.event;
    },

    warningDescription() {
      return this.warnings?.event?.description;
    },

    warningPriority() {
      return this.warnings?.event?.priority;
    },

    warningIssued() {
      return this.warnings?.event?.dateTime[1]?.textSummary;
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1 };
  },

  mounted() {
    this.page = 1;
    this.pages = Math.ceil(this.warnings?.length / MAX_WARNINGS_PER_PAGE);

    if (this.warningsUnavailable) EventBus.emit("warnings-complete");

    // this.pageChangeInterval = setInterval(() => {
    //   this.page = ++this.page % (this.pages + 1);
    //   if (!this.page || this.observationsUnavailable) return EventBus.emit("observation-complete");
    // }, PAGE_CHANGE_FREQUENCY);
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {},
};
</script>

<style lang="scss" scoped>
#title {
  font-size: 30px;
  margin-bottom: 30px;
  text-align: center;
}

#warnings_table {
  .description,
  .city {
    font-size: 25px;
    margin-bottom: 5px;
  }

  .issued-at {
    font-size: 20px;
  }

  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}
</style>
