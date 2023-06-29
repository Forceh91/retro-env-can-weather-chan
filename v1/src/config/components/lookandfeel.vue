<template>
  <div>
    <h4>Look and Feel</h4>
    <p>Font choices are as follows:</p>
    <ul>
      <li><b>VT323:</b> Closest to the original font and based off an 80s character generator font</li>
      <li><b>VCR:</b> Thinner font based off what you would've seen from a VCR Player</li>
    </ul>
    <label for="font_name_selector"><b>Font</b></label>
    <b-form-select id="font_name_selector" v-model="mutableFont" :options="options"></b-form-select>
    <b-button variant="success" class="mt-3" @click="saveLookAndFeelConfig" :disabled="saveState.saving">Save</b-button>
  </div>
</template>

<script>
const FONT_OPTIONS = ["vt323", "vcr"];
export default {
  name: "config-look-and-feel",
  props: {
    lookAndFeel: Object,
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      options: FONT_OPTIONS,
      mutableFont: "",
    };
  },

  mounted() {
    this.createMutableMisc();
  },

  methods: {
    createMutableMisc() {
      const { font } = this.lookAndFeel;
      this.mutableFont = font || FONT_OPTIONS[0];
    },

    saveLookAndFeelConfig() {
      this.$emit("save", { font: this.mutableFont });
    },
  },
};
</script>

<style lang="scss" scoped>
#font_name_selector {
  text-transform: uppercase;
}
</style>
