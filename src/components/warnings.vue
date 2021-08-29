<template>
  <div id="warnings">
    <div id="title">* WEATHER WARNINGS *</div>
    <div v-if="warningsUnavailable">No warnings in effect</div>
    <ul v-else id="warnings_table">
      <li v-for="(warning, ix) in warningsList" :key="ix" :class="{ flash: shouldFlashWarning(warning) }">
        <div class="description">{{ warning.description }}</div>
        <div class="city"><template v-if="warning.type !== `ended`">In Effect</template> For {{ city }}</div>
      </li>
    </ul>
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
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1, warningsList: [] };
  },

  mounted() {
    this.page = 1;
    this.pages = Math.ceil(this.warnings?.length / MAX_WARNINGS_PER_PAGE);

    if (this.warningsUnavailable) EventBus.emit("warnings-complete");
    else {
      if (!Array.isArray(this.warnings.event)) this.warningsList = [this.warnings.event];
      else this.warningsList = [...this.warnings.event];
    }

    // this.pageChangeInterval = setInterval(() => {
    //   this.page = ++this.page % (this.pages + 1);
    //   if (!this.page || this.observationsUnavailable) return EventBus.emit("observation-complete");
    // }, PAGE_CHANGE_FREQUENCY);
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    shouldFlashWarning(warning) {
      if (!warning) return false;

      return warning.priority === "urgent" && warning.type !== "ended";
    },
  },
};
</script>

<style lang="scss" scoped>
#title {
  font-size: 30px;
  margin-bottom: 30px;
  text-align: center;
}

#warnings_table {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    &:not(:last-child) {
      margin-bottom: 20px;
    }

    text-align: center;

    &.flash {
      animation: flash 0.8s step-start 0s infinite;
    }
  }

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

/* flashing warnings from the original were 4 frames hidden, 11 frames visible */
/* this was at 25fps (lets say 30), so that means 26.6% of the time the warning was hidden */
/* this renders at 60fps (or should) so if we make 13% then this will close to accurate */
@keyframes flash {
  13% {
    opacity: 0;
  }
}
</style>
