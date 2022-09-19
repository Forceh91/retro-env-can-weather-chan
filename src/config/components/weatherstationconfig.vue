<template>
  <div>
    <h4>Weather Station</h4>
    <p>This is where you will setup the weather station that the currently observed conditions are pulled from.</p>
    <p>
      <b>Important:</b> Not all weather stations are manned 24/7, if you pick one of these stations the current
      conditions (Sunny, Mostly Cloudy, etc.) won't always be present.
    </p>
    <p>
      <b>Important:</b> Not all weather stations receive Air Quality warnings, this is a best guessed based off the
      tracked city.
    </p>
    <p><b>Important:</b> The CAP alert system also only picks out alerts based off the name of the tracked city.</p>
    <p><b>Current Weather Station</b>: {{ name }}, {{ province }} ({{ uuid }})</p>

    <h4>Available Stations</h4>
    <input
      type="search"
      class="form-control mt-3 mb-3"
      v-model="searchTerm"
      placeholder="Search for a station name..."
    />
    <table class="table table-hover table-striped">
      <thead>
        <tr>
          <th>Station Name</th>
          <th>Province</th>
          <th>Station UUID</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="station in filteredStations"
          :key="`available-station-${station.code}`"
          :class="{ 'table-primary': station.code === uuid }"
        >
          <td>{{ station.name }}</td>
          <td>{{ station.province }}</td>
          <td>{{ station.code }}</td>
          <td>
            <b-button
              :disabled="uuid === station.code || saveState.saving"
              variant="success"
              @click="saveWeatherStation(station)"
            >
              Select Station
            </b-button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
const MIN_SEARCH_LENGTH = 3;
export default {
  name: "weather-station-config",
  props: {
    weatherStation: {
      type: Object,
      default: () => {
        return {};
      },
    },
    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  data() {
    return {
      availableStations: [],
      searchTerm: "",
    };
  },

  computed: {
    name() {
      return this.weatherStation.name;
    },

    province() {
      return this.weatherStation.province;
    },

    uuid() {
      return this.weatherStation.location;
    },

    filteredStations() {
      if (this.searchTerm && this.searchTerm.length >= MIN_SEARCH_LENGTH)
        return this.availableStations.filter((a) => a.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      else return this.availableStations;
    },
  },

  mounted() {
    this.fetchWeatherStationsFromECCC();
  },

  methods: {
    fetchWeatherStationsFromECCC() {
      this.$http.get("/config/eccc-weather-stations").then((resp) => {
        const data = resp.data;
        if (!data) return;

        this.availableStations.splice(0, this.availableStations.length, ...data);
      });
    },

    saveWeatherStation(station) {
      this.$emit("save", { station });
    },
  },
};
</script>

<style lang="scss" scoped></style>
