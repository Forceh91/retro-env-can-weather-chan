<template>
  <div>
    <h4>Climate Normals</h4>
    <p>
      This is where you will setup the weather station that climate normals data is pulled from. This is the
      <b>Normal Precipitation</b> (City Stats Page) and <b>Normal Column</b> on the "Weather Statistics for MONTH"
      screen.
    </p>
    <p>
      You can generally set this to the same station where you are getting the current conditions from without too much
      issue.
    </p>
    <p>
      <b>Important:</b> Not all weather stations track data correctly so this allows you to select another station
      (ideally close by) that can provide that information instead. For example,
      <i>"Winnipeg Richardson Intl A"</i> doesn't track both last year and precip data so we use a station in a
      different location referred to as
      <i>"Winnipeg A CS"</i>
    </p>
    <p>
      <b>Important:</b> When deciding if you should select a station or not you check that the Start/End date columns
      are within the last year.
    </p>

    <h4>Available Stations</h4>
    <p>
      Please refer to this
      <a
        href="https://climate.weather.gc.ca/climate_normals/station_select_1981_2010_e.html?searchType=stnProv"
        target="_blank"
        >page</a
      >
      to see if a station has climate normals.
    </p>
    <p>
      Please refer to this
      <a href="https://drive.google.com/file/d/1HDRnj41YBWpMioLPwAFiLlK4SK8NV72C/view?usp=sharing" target="_blank"
        >CSV File</a
      >
      for a list of available stations. The <b>Climate ID</b>, <b>Station ID</b>, <b>Province</b> columns are the
      numbers that need entering below.
    </p>
    <p>
      <b>You cannot mix and match these IDs, the data must come from the same row or the data will not be collected.</b>
    </p>

    <div>
      <b>Climate Normals Climate ID</b>:
      <input type="text" class="form-control mt-2 mb-3" v-model="mutableClimateNormalsClimateID" />
    </div>
    <div>
      <b>Climate Normals Station ID</b>:
      <input type="number" class="form-control mt-2 mb-3" v-model="mutableClimateNormalsStationID" />
    </div>

    <div>
      <b>Climate Normals Province (Manitoba = MB, Ontario = ON, etc.)</b>:
      <input type="text" class="form-control mt-2 mb-3" v-model="mutableClimateNormalsProvince" />
    </div>
    <b-button
      :disabled="!mutableClimateNormalsClimateID || !mutableClimateNormalsStationID || !mutableClimateNormalsProvince"
      variant="success"
      @click="saveClimateNormalsStation()"
    >
      Save
    </b-button>
  </div>
</template>

<script>
export default {
  name: "climate-normals-config",
  props: {
    weatherStation: {
      type: Object,
      default: () => {
        return {};
      },
    },
    climateNormalsClimateID: {
      type: [Number, String],
      default: 0,
    },
    climateNormalsStationID: Number,
    climateNormalsProvince: String,
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      mutableClimateNormalsClimateID: 0,
      mutableClimateNormalsStationID: 0,
      mutableClimateNormalsProvince: "",
    };
  },

  mounted() {
    this.generateMutableClimateNormalsIDs();
  },

  methods: {
    generateMutableClimateNormalsIDs() {
      this.mutableClimateNormalsClimateID = this.climateNormalsClimateID || 0;
      this.mutableClimateNormalsStationID = this.climateNormalsStationID || 0;
      this.mutableClimateNormalsProvince = this.climateNormalsProvince || "";
    },

    saveClimateNormalsStation() {
      if (!isNaN(this.mutableClimateNormalsClimateID))
        this.mutableClimateNormalsClimateID = parseInt(this.mutableClimateNormalsClimateID);

      const province = (this.mutableClimateNormalsProvince || "").toUpperCase();

      this.$emit("save", {
        climateID: this.mutableClimateNormalsClimateID,
        stationID: this.mutableClimateNormalsStationID,
        province,
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
