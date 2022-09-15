<template>
  <div>
    <h4>Crawler Messages</h4>
    <p>
      These are the crawler messages that run across the top of the screen. Recommended character length is around 128.
      Add one message per line
    </p>
    <textarea class="form-control mb-3" v-model="mutableCrawlerMessages" :rows="rows" />
    <b-button variant="success" @click="saveCrawlerMessages">Save</b-button>
  </div>
</template>

<script>
export default {
  name: "config-crawler-messages",
  props: {
    crawlerMessages: {
      type: Array,
      default: () => [],
    },
  },

  data() {
    return {
      mutableCrawlerMessages: "",
    };
  },

  computed: {
    rows() {
      return this.crawlerMessages && this.crawlerMessages.length + 3;
    },
  },

  mounted() {
    this.createMutableCrawlerMessages();
  },

  methods: {
    createMutableCrawlerMessages() {
      this.mutableCrawlerMessages = this.crawlerMessages.join("\n");
    },

    saveCrawlerMessages() {
      this.$emit("save", { value: this.mutableCrawlerMessages.split("\n") });
    },
  },
};
</script>

<style lang="scss" scoped></style>
