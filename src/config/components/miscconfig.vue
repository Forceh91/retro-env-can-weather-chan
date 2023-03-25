<template>
  <div>
    <h4>Misc. Config</h4>
    <b-form-checkbox id="province-tracking" v-model="mutableProvinceHighLowTracking">
      Track High/Low temps and precipitation data each day for the Manitoba province?
    </b-form-checkbox>
    <b-form-checkbox id="reject-in-hour-condition-updates" v-model="mutableMisc.rejectInHourConditionUpdates">
      Reject in-hour condition updates (only update the current conditions once an hour)
    </b-form-checkbox>
    <b-button variant="success" class="mt-3" @click="saveMiscConfig" :disabled="saveState.saving">Save</b-button>
  </div>
</template>

<script>
export default {
  name: "config-province-tracking",
  props: {
    misc: Object,
    provinceHighLowTracking: Boolean,
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      mutableProvinceHighLowTracking: false,
      mutableMisc: {},
    };
  },

  mounted() {
    this.createMutableMisc();
  },

  methods: {
    createMutableMisc() {
      this.mutableProvinceHighLowTracking = this.provinceHighLowTracking;
      this.mutableMisc = { ...this.misc };
    },

    saveMiscConfig() {
      this.$emit("save", { provinceHighLowTracking: this.mutableProvinceHighLowTracking, misc: this.mutableMisc });
    },
  },
};
</script>

<style lang="scss" scoped></style>
