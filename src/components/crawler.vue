<template>
  <div ref="crawlmessage" id="crawl_message" :style="{ 'margin-left': `${marginLeft}px` }">
    {{ currentCrawlMessage }}
  </div>
</template>

<script>
const SCROLL_SPEED = 100; // 10px per ms

export default {
  name: "Crawler",
  props: {
    messages: {
      type: Array,
      default: () => [],
    },
  },

  computed: {
    hasMessages() {
      return this.messages && this.messages.length;
    },

    currentCrawlMessage() {
      return this.hasMessages ? this.messages[this.crawlIx] : "";
    },
  },

  data() {
    return {
      crawlIx: 0,
      marginLeft: 0,
      parentWidth: 0,
      parentPadding: 100, // 50px left and right on the top bar
      messageWidth: 0,
    };
  },

  mounted() {
    this.$nextTick(() => {
      const topBar = document.querySelector("#top_bar");
      if (topBar) this.parentWidth = topBar.clientWidth;

      this.startCrawler();
    });
  },

  methods: {
    startCrawler() {
      this.marginLeft = this.parentWidth || 0;
      const crawlMessage = this.$refs.crawlmessage;
      if (!crawlMessage) return;

      // calculate how long this message will be + the padding the top bar has so it goes all the way off
      if (!this.messageWidth) this.messageWidth = crawlMessage.clientWidth + this.parentPadding;

      // start the scroll
      this.scrollMessage();
    },

    switchToNextCrawlMessage() {
      // switch to the next one (and auto-loop to the start) and start the crawler
      this.crawlIx = ++this.crawlIx % this.messages?.length;

      this.$nextTick(() => {
        this.startCrawler();
      });
    },

    scrollMessage() {
      // if theres still message to scroll then do so
      // otherwise switch to the next one
      if (this.marginLeft >= -this.messageWidth) {
        setTimeout(() => {
          this.marginLeft -= 10;
          this.scrollMessage();
        }, SCROLL_SPEED);
      } else this.switchToNextCrawlMessage();
    },
  },
};
</script>

<style lang="scss">
#crawl_message {
  white-space: nowrap;
  width: 100%;
}
</style>
