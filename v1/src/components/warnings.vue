<template>
  <div id="warnings">
    <div v-if="warningsUnavailable">Warnings/Alerts temporarily unavailable</div>
    <ul v-else id="warnings_table">
      <li v-for="(warning, ix) in paginatedWarnings" :key="ix">
        <template v-if="!warning.isSTW">
          <div :class="{ flash: warningShouldFlash(warning) }" class="headline">
            {{ cleanupHeadline(warning.headline) }}
          </div>
          <div class="description">{{ truncateWarningDescription(warning.description) }}</div>
        </template>
        <Severetstormwatch v-else></Severetstormwatch>
      </li>
    </ul>
  </div>
</template>

<script>
const MAX_WARNINGS_PER_PAGE = 1;
export const PAGE_CHANGE_FREQUENCY = 14 * 1000;

import { EventBus } from "../js/EventBus";
import warningsMixin from "../mixins/warnings.mixin";
import Severetstormwatch from "./severetstormwatch.vue";

export default {
  name: "Warnings",
  mixins: [warningsMixin],
  components: { Severetstormwatch },
  props: {
    warnings: {
      type: Array,
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

    isSevereThunderstormWatchActive() {
      return this.warnings.some((warning) => this.isWarningSevereThunderstormWatch(warning.headline));
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

      // if we have a stw in place we should insert out info page after it
      if (this.isSevereThunderstormWatchActive) {
        const ix = this.warningsList.findIndex((warning) => this.isWarningSevereThunderstormWatch(warning.headline));
        if (ix !== -1) this.warningsList.splice(ix + 1, 0, { isSTW: true });
      }

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

    cleanupHeadline(headline) {
      headline = (headline || "").replace(" in effect", "");
      return headline;
    },

    truncateWarningDescription(description) {
      const paragraphSplit = description.split(/.\s\s/);

      // get rid of some weird ### description stuff
      let shortDescription = paragraphSplit.slice(0, 2).join(". ");
      shortDescription = (shortDescription || "").split(/\n\n###/g)[0];

      // remove impacted locations as its a giant list
      shortDescription = shortDescription.split("Locations impacted")[0];
      return shortDescription.trim();
    },
  },
};

/*
      http://docs.oasis-open.org/emergency/cap/v1.2/CAP-v1.2.html

urgency.

code


The code denoting the urgency of the subject event of the alert message (REQUIRED)


(1) The <urgency>, <severity>, and <certainty> elements collectively distinguish less emphatic from more emphatic messages.

(2) Code Values:

“Immediate” - Responsive action SHOULD be taken immediately

“Expected” - Responsive action SHOULD be taken soon (within next hour)

“Future” - Responsive action SHOULD be taken in the near future

“Past” - Responsive action is no longer required

“Unknown” - Urgency not known

severity.

code


The code denoting the severity of the subject event of the alert message (REQUIRED)


(1) The <urgency>, <severity>, and <certainty> elements collectively distinguish less emphatic from more emphatic messages.

(2) Code Values:

“Extreme” - Extraordinary threat to life or property

“Severe” - Significant threat to life or property

“Moderate” - Possible threat to life or property

“Minor” – Minimal to no known threat to life or property

“Unknown” - Severity unknown
      */
</script>

<style lang="scss" scoped>
@import "../style/warnings.scss";

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
  text-align: center;
  overflow: hidden;
  width: 100%;
}
</style>
