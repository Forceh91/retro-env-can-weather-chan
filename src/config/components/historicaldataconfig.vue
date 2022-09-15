<template>
  <div>
    <h4>Historical Data</h4>
    <p>
      This is where you will setup the weather station that historical data is pulled from. This is the
      <b>Precipitation</b> (City Stats Page) and <b>Last Year Temps</b> (Almanac Page)
    </p>
    <p>
      <b>Important:</b> Not all weather stations track data correctly so this allows you to select another station
      (ideally close by) that can provide that information instead. For example,
      <i>"Winnipeg Richardson Intl A"</i> doesn't track both last year and precip data so we use a station in a
      different location referred to as
      <i>"Winnipeg A CS"</i>
    </p>
    <p>
      <b>Important:</b> When deciding if you should select a station or not you check that the Max Temp, Min Temp, and
      Total Precip columns aren't blank.
    </p>

    <h4>Available Stations</h4>
    <p>
      Please refer to this
      <a href="https://drive.google.com/file/d/1HDRnj41YBWpMioLPwAFiLlK4SK8NV72C/view?usp=sharing" target="_blank"
        >CSV File</a
      >
      for a list of available stations. The <b>Station ID</b> column is the number that needs entering below.
    </p>
    <div>
      <b>Current Historical Data Station ID</b>:
      <input type="number" class="form-control mt-2 mb-3" v-model="mutableHistoricalDataStation" />
    </div>
    <b-button :disabled="!mutableHistoricalDataStation" variant="success" @click="saveHistoricalDataStation()">
      Save
    </b-button>
  </div>
</template>

<script>
export default {
  name: "historical-data-config",
  props: {
    weatherStation: {
      type: Object,
      default: () => {
        return {};
      },
    },
    historicalDataStation: Number,
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      mutableHistoricalDataStation: -1,
    };
  },

  mounted() {
    this.generateMutableHistoricalDataStation();
  },

  methods: {
    generateMutableHistoricalDataStation() {
      this.mutableHistoricalDataStation = this.historicalDataStation;
    },

    saveHistoricalDataStation() {
      this.$emit("save", { stationID: this.mutableHistoricalDataStation });
    },
  },
};
</script>

<style lang="scss" scoped></style>
