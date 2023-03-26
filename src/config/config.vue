<template>
  <div id="config_page">
    <div v-if="isFetchingConfig">
      Fetching config... please wait.
    </div>
    <div v-if="hasLoadedConfig">
      <b-tabs content-class="mt-3">
        <b-tab title="Weather Station" active>
          <weatherstationconfig
            :weather-station="config.config.primaryLocation"
            :save-state="saveState"
            @save="saveWeatherStation"
          />
        </b-tab>
        <b-tab title="Historical Data">
          <historicaldataconfig
            :weather-station="config.config.primaryLocation"
            :historical-data-station="config.config.historicalDataStationID"
            :save-state="saveState"
            @save="saveHistoricalDataStation"
          />
        </b-tab>
        <b-tab title="Climate Normals">
          <climatenormalsconfig
            :weather-station="config.config.primaryLocation"
            :climate-normals-climateID="config.config.climateNormalsClimateID"
            :climate-normals-stationID="config.config.climateNormalsStationID"
            :climate-normals-province="config.config.climateNormalsProvince"
            :save-state="saveState"
            @save="saveClimateNormalsStation"
          />
        </b-tab>
        <b-tab title="Crawler Messages">
          <crawlermessages :crawler-messages="config.crawler" :save-state="saveState" @save="saveCrawlerMessages" />
        </b-tab>
        <b-tab title="Playlist">
          <playlistconfig :playlist="config.playlist" :save-state="saveState" @save="reloadPlaylist" />
        </b-tab>
        <b-tab title="Info Screens">
          <infoscreensconfig :screens="config.info_screens" :save-state="saveState" @save="saveInfoScreens" />
        </b-tab>
        <b-tab title="Misc.">
          <miscconfig
            :misc="config.config.misc"
            :province-high-low-tracking="config.config.provinceHighLowEnabled"
            :save-state="saveState"
            @save="saveMiscConfig"
          />
        </b-tab>
        <b-tab title="Look and Feel">
          <lookandfeelconfig
            :look-and-feel="config.config.lookAndFeel"
            :save-state="saveState"
            @save="saveLookAndFeelConfig"
          />
        </b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import crawlermessages from "./components/crawlermesages.vue";
import playlistconfig from "./components/playlistconfig.vue";
import weatherstationconfig from "./components/weatherstationconfig.vue";
import historicaldataconfig from "./components/historicaldataconfig.vue";
import climatenormalsconfig from "./components/climatenormalsconfig.vue";
import miscconfig from "./components/miscconfig.vue";
import lookandfeelconfig from "./components/lookandfeel.vue";
import infoscreensconfig from "./components/infoscreens.vue";

export default {
  name: "config",

  components: {
    crawlermessages,
    playlistconfig,
    weatherstationconfig,
    historicaldataconfig,
    climatenormalsconfig,
    miscconfig,
    lookandfeelconfig,
    infoscreensconfig,
  },

  data() {
    return {
      state: {
        fetching: false,
      },
      saveState: {
        saving: false,
        success: false,
        error: false,
      },
      config: null,
    };
  },

  mounted() {
    this.fetchConfig();
  },

  computed: {
    isFetchingConfig() {
      return this.state.fetching;
    },

    hasLoadedConfig() {
      return this.config !== null;
    },
  },

  methods: {
    fetchConfig() {
      this.startFetching();

      this.$http
        .get("config/all")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.config = data;
        })
        .then(() => {
          this.stopFetching();
        });
    },

    startFetching() {
      this.state.fetching = true;
    },

    stopFetching() {
      this.state.fetching = false;
    },

    startSaving() {
      this.saveState.saving = true;
      this.resetSaving();
    },

    resetSaving() {
      this.saveState.success = false;
      this.saveState.error = false;
    },

    saveSuccess() {
      this.saveState.saving = false;
      this.saveState.success = true;
      this.saveState.error = false;
    },

    saveFailed() {
      this.saveState.saving = false;
      this.saveState.success = false;
      this.saveState.error = true;
    },

    saveCrawlerMessages(e) {
      const { value } = e || {};
      if (value === null || value === undefined) return;

      this.$http
        .post("config/crawler", { crawler_messages: value })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    reloadPlaylist() {
      this.$http
        .post("config/playlist")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { playlist } = data;
          if (!playlist) return;

          this.config.playlist.splice(0, this.config.playlist.length, ...playlist);
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveWeatherStation(e) {
      const { station } = e || {};
      if (station === null || station === undefined) return;

      this.$http
        .post("config/weather-station", { station })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.config.config.primaryLocation = data.station;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveHistoricalDataStation(e) {
      const { stationID } = e || {};
      if (!stationID) return;

      this.$http
        .post("config/historical-data-station", { stationID })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.config.config.historicalDataStationID = data.historicalDataStationID;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveClimateNormalsStation(e) {
      const { climateID, stationID, province } = e || {};
      if (!climateID || !stationID || !province) return;

      this.$http
        .post("config/climate-normals-station", { climateID, stationID, province })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.config.config.climateNormalsClimateID = data.climateNormalsClimateID;
          this.config.config.climateNormalsStationID = data.climateNormalsStationID;
          this.config.config.climateNormalsProvince = data.climateNormalsProvince;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveMiscConfig(e) {
      if (!e) return;

      this.$http
        .post("/config/province-high-low-precip-tracking", { provinceHighLowTracking: e.provinceHighLowTracking })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { provinceHighLowEnabled } = data || {};
          this.config.config.provinceHighLowEnabled = provinceHighLowEnabled;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });

      this.$http
        .post("/config/misc", e.misc || {})
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { misc } = data || {};
          this.config.config.misc = misc;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveLookAndFeelConfig(e) {
      if (!e) return;

      this.$http
        .post("/config/look-and-feel/font", e)
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { lookAndFeel } = data || {};
          this.config.config.lookAndFeel = lookAndFeel;
          this.saveSuccess();
        })
        .catch(() => {
          this.saveFailed();
        });
    },

    saveInfoScreens(e) {
      const { callback } = e;
      const data = e;
      delete data.callback;

      this.$http
        .post("/config/infoscreens/create", data)
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          const { info_screens } = data;
          this.config.info_screens = info_screens;
          this.saveSuccess();

          typeof callback === "function" && callback();
        })
        .catch(() => {
          this.saveFailed();
        });
    },
  },
};
</script>

<style lang="scss" scoped>
#config_page {
  padding: 20px;
}
</style>
