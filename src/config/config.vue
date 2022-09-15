<template>
  <div id="config_page">
    <div v-if="isFetchingConfig">
      Fetching config... please wait.
    </div>
    <div v-if="hasLoadedConfig">
      <b-tabs content-class="mt-3">
        <b-tab title="Crawler Messages" active>
          <crawlermessages :crawler-messages="config.crawler" :save-state="saveState" @save="saveCrawlerMessages" />
        </b-tab>
        <b-tab title="Playlist">
          <playlistconfig :playlist="config.playlist" :save-state="saveState" @save="reloadPlaylist" />
        </b-tab>
        <b-tab title="Weather Station"><p>I'm a disabled tab!</p></b-tab>
        <b-tab title="Historical Data"><p>I'm a disabled tab!</p></b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import crawlermessages from "./components/crawlermesages.vue";
import playlistconfig from "./components/playlistconfig.vue";

export default {
  name: "config",

  components: { crawlermessages, playlistconfig },

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
  },
};
</script>

<style lang="scss" scoped>
#config_page {
  padding: 20px;
}
</style>
