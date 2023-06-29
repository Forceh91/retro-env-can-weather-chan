<template>
  <div id="infoscreen">
    <div v-if="infoScreensUnavailable">Info screens temporarily unavailable</div>
    <ul v-else id="infoscreen_table">
      <li v-for="(screen, ix) in paginatedInfoScreens" :key="ix" v-html="formattedInfoScreen(screen.message)"></li>
    </ul>
  </div>
</template>

<script>
const MAX_INFO_SCREENS_PER_PAGE = 1;
const PAGE_CHANGE_FREQUENCY = 20 * 1000;

import { EventBus } from "../js/EventBus";

export default {
  name: "InfoScreens",
  props: {
    infoScreens: {
      type: Array,
      default: () => {},
    },
  },

  computed: {
    infoScreensUnavailable() {
      return !this.infoScreens || !this.infoScreens.length;
    },

    paginatedInfoScreens() {
      const startIndex = Math.max(0, (this.page - 1) * MAX_INFO_SCREENS_PER_PAGE);
      const endIndex = Math.min(startIndex + MAX_INFO_SCREENS_PER_PAGE, this.infoScreenList?.length);
      return this.infoScreenList?.slice(startIndex, endIndex);
    },
  },

  data() {
    return { page: 1, pageChangeInterval: null, pages: 1, infoScreenList: [] };
  },

  mounted() {
    this.generateInfoScreens();
  },

  unmounted() {
    clearInterval(this.pageChangeInterval);
  },

  methods: {
    generateInfoScreens() {
      // no info screens so skip
      if (this.infoScreensUnavailable) return EventBus.emit("info-screens-complete");

      // got info screens so deal with them
      this.infoScreenList = [...this.infoScreens];

      this.page = 1;
      this.pages = Math.ceil(this.infoScreenList?.length / MAX_INFO_SCREENS_PER_PAGE);

      this.pageChangeInterval = setInterval(() => {
        this.changePage();
      }, PAGE_CHANGE_FREQUENCY);
    },

    changePage() {
      this.page = ++this.page % (this.pages + 1);
      if (!this.page || this.infoScreensUnavailable) return EventBus.emit("info-screens-complete");
    },

    formattedInfoScreen(message) {
      return message.replace(/\n/gi, "<br/>").replace(/\t/gi, "&nbsp;&nbsp;");
    },
  },
};
</script>

<style lang="scss" scoped>
#infoscreen {
  width: calc(100% - 100px);
}

#infoscreen_table {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;

  li {
    &:not(:last-child) {
      margin-bottom: 20px;
    }

    width: 100%;
  }

  align-items: center;
  display: flex;
  flex-direction: column;
  height: calc(100% - 5px);
  overflow: hidden;
  text-align: center;
  width: 100%;
}
</style>
