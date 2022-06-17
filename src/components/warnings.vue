<template>
  <div id="warnings">
    <div v-if="warningsUnavailable">Warnings/Alerts temporarily unavailable</div>
    <ul v-else id="warnings_table">
      <li v-for="(warning, ix) in paginatedWarnings" :key="ix" :class="{ flash: shouldFlashWarning(warning) }">
        <!-- <div class="description">{{ warning.description }}</div>
        <div class="city"><template v-if="warning.type !== `ended`">In Effect</template> For {{ city }}</div> -->
        <div class="headline">&nbsp;&nbsp;&nbsp;&nbsp;{{ cleanupHeadline(warning.headline) }}</div>
        <div class="description">&nbsp;&nbsp;&nbsp;&nbsp;{{ truncateWarningDescription(warning.description) }}</div>
      </li>
    </ul>
  </div>
</template>

<script>
const MAX_WARNINGS_PER_PAGE = 1;
const PAGE_CHANGE_FREQUENCY = 20 * 1000;

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
      return !this.warnings || !this.warnings.length;
    },

    paginatedWarnings() {
      const startIndex = Math.max(0, (this.page - 1) * MAX_WARNINGS_PER_PAGE);
      const endIndex = Math.min(startIndex + MAX_WARNINGS_PER_PAGE, this.warningsList?.length);
      return this.warningsList?.slice(startIndex, endIndex);
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1, warningsList: [] };
  },

  mounted() {
    this.generateWarningsScreen();
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    generateWarningsScreen() {
      // no warnings so skip
      if (this.warningsUnavailable) return EventBus.emit("warnings-complete");

      // got warnings so deal with them
      // if (!Array.isArray(this.warnings.event)) this.warningsList = [this.warnings.event];
      // else this.warningsList = [...this.warnings.event];
      this.warningsList = [...this.warnings];

      this.page = 1;
      this.pages = Math.ceil(this.warningsList?.length / MAX_WARNINGS_PER_PAGE);

      this.pageChangeInterval = setInterval(() => {
        this.changePage();
      }, PAGE_CHANGE_FREQUENCY);
    },

    changePage() {
      this.page = ++this.page % (this.pages + 1);
      if (!this.page || this.warningsUnavailable) return EventBus.emit("warnings-complete");
    },

    shouldFlashWarning(warning) {
      if (!warning) return false;

      return warning.urgency === "Immediate";
    },

    cleanupHeadline(headline) {
      headline = (headline || "").replace(" in effect", "");
      return headline;
    },

    truncateWarningDescription(description) {
      // get rid of some weird ### description stuff
      description = (description || "").split("###")[0];

      // remove impacted locations as its a giant list
      description = description.split("Locations impacted")[0];
      return description.trim();
    },
  },
};
</script>

<style lang="scss" scoped>
#warnings {
  width: calc(100% - 100px);
}

#warnings_table {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  li {
    &:not(:last-child) {
      margin-bottom: 20px;
    }

    &.flash .headline {
      animation: flash 0.8s step-start 0s infinite;
    }

    .headline,
    .description {
      width: 100%;
    }

    width: 100%;
  }

  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100% - 5px);
  overflow: hidden;
  width: 100%;
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
