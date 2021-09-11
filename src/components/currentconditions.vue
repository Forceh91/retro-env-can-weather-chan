<template>
  <div id="current_conditions">
    <div v-if="!conditions" id="no_data">Current conditions temporarily unavailable</div>
    <template v-else>
      <conditions :city="city" :observed="observed" :conditions="conditions" />
      <div id="rise_set">
        <div class="full-width centre-align">
          <span class="label">{{ sunriseset }}</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import conditions from "./conditions.vue";

export default {
  name: "CurrentConditions",
  props: {
    city: String,
    observed: String,
    conditions: Object,
    riseset: Object,
  },

  components: { conditions },

  computed: {
    sunriseset() {
      const riseSet = this.riseset;
      if (!riseSet) return "";

      const rise = riseSet.dateTime[1];
      const set = riseSet.dateTime[3];

      return `Sunrise..${rise?.hour}:${rise?.minute} AM Sunset..${this.pad(set?.hour % 12)}:${set?.minute} PM`;
    },
  },

  mounted() {},

  methods: {
    pad(val) {
      return val < 10 ? `0${val}` : val;
    },
  },
};
</script>

<style lang="scss" scoped>
#current_conditions {
  display: flex;
  flex-direction: column;
  width: calc(100% - 60px);

  #rise_set {
    margin-top: auto;
    text-align: center;
  }
}
</style>
