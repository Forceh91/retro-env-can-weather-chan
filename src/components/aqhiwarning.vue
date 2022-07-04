<template>
  <div id="aqhi_warning">
    <div v-if="doesAQHINeedWarning">
      <div>WPG AIR QUALITY HEALTH INDEX AT</div>
      <div v-html="observedTimeAndIndex"></div>
      <div v-html="aqhiWarningMessage"></div>
    </div>
  </div>
</template>

<script>
import { format } from "date-fns";
import stringpadmixin from "../mixins/stringpad.mixin";
import { EventBus } from "../js/EventBus";

export default {
  name: "aqhi-warning",
  mixins: [stringpadmixin],
  props: {
    aqhi: Object,
  },

  computed: {
    doesAQHINeedWarning() {
      return this.aqhi?.needsWarning;
    },

    observedTime() {
      return this.padString(this.aqhi?.hourObserved, 5, true, "&nbsp;");
    },

    observedMonthDate() {
      const date = Date.now();
      return format(date, "MMM dd").replace(/\s0/, "&nbsp;&nbsp;");
    },

    observedAQHI() {
      return this.padString((this.aqhi?.aqhi || "").toString(), 2, true, "&nbsp;");
    },

    observedTimeAndIndex() {
      return `${this.observedTime} ${this.observedMonthDate} IS ${this.observedAQHI}-${this.getAQHIRisk(
        this.aqhi?.aqhi
      )} Risk`;
    },

    aqhiWarningMessage() {
      return this.getAQHIWarningMessage(this.aqhi?.aqhi);
    },
  },

  mounted() {
    if (!this.doesAQHINeedWarning) EventBus.emit("aqhi-not-needed");
  },

  methods: {
    getAQHIRisk(aqhi) {
      if (aqhi > 10) return "V High";
      if (aqhi >= 7) return "High";
      if (aqhi >= 4) return "Moderate";
      else return "";
    },

    getAQHIWarningMessage(aqhi) {
      if (aqhi > 10)
        return "REDUCE/RESCHEDULE STRENUOUS<br/>ACTIVITIES OUTDOORS IF YOU<br/>EXPERIENCE SYMPTOMS SUCH AS<br/>COUGHING & THROAT IRRITATION.<br/>AVOID IF YOU HAVE HEART/LUNG<br/>CONDITIONS &amp; ELDERLY/CHILDREN";
      if (aqhi >= 7)
        return "CONSIDER REDUCING/RESCHEDULING<br/>STRENUOUS ACTIVITIES OUTDOORS IF<br/>YOU EXPERIENCE SYMPTOMS SUCH AS<br/>COUGHING & THROAT IRRITATION.<br/>THOSE WITH HEART/LUNG CONDITIONS<br/>&amp; ELDERLY/CHILDREN=GREATER RISK.";
      if (aqhi >= 4)
        return "CONSIDER MODIFYING YOUR USUAL<br/>OUTDOOR ACTIVITIES IF YOU<br/>EXPERIENCE SYMPTOMS SUCH AS<br/>COUGHING AND THROAT IRRITATION.<br/>THOSE WITH HEART OR LUNG<br/>CONDITIONS ARE AT GREATER RISK.";
      else return "";
    },
  },
};
</script>

<style lang="scss" scoped>
#aqhi_warning {
  align-items: center;
  display: flex;
  flex-direction: column;
}
</style>
