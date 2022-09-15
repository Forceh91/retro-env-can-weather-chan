<template>
  <div id="config_page">
    <div v-if="isFetchingConfig">
      Fetching config... please wait.
    </div>
    <div v-if="hasLoadedConfig">
      <b-tabs content-class="mt-3">
        <b-tab title="Crawler Messages" active>
          <crawlermessages :crawler-messages="config.crawler" @save="saveCrawlerMessages" />
        </b-tab>
        <b-tab title="Playlist"><p>I'm the second tab</p></b-tab>
        <b-tab title="Weather Station"><p>I'm a disabled tab!</p></b-tab>
        <b-tab title="Historical Data"><p>I'm a disabled tab!</p></b-tab>
      </b-tabs>
    </div>
  </div>
</template>

<script>
import crawlermessages from "./components/crawlermesages.vue";

export default {
  name: "config",

  components: { crawlermessages },

  data() {
    return {
      state: {
        fetching: false,
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

    saveCrawlerMessages(e) {
      const { value } = e || {};
      if (value === null || value === undefined) return;

      this.$http
        .post("config/crawler", { crawler_messages: value })
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          console.log(data);
        })
        .then(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
#config_page {
  padding: 20px;
}
</style>
