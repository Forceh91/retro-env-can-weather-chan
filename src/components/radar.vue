<template>
  <div id="radar_page">
    <div v-if="radarSeason" id="title">{{ radarSeason }} radar<br /></div>
    <div id="ascii_radar">
      <div id="map">
        <span id="map_data" v-html="parsedRadarMap"></span>
        <div id="data"><div id="data_visible_area" v-html="parsedRadarImage"></div></div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import { EventBus } from "../js/EventBus";

const RADAR_IMAGE_VISIBLE_DURATION = 1 * 1000;

export default {
  name: "ascii-radar",

  watch: {
    radarImages(newVal) {
      if (newVal.length && !this.visibleRadarImage) this.cycleRadarImages();
    },
  },

  data() {
    return {
      visibleRadarImage: null,
      visibleRadarImageIx: 0,
    };
  },

  computed: {
    ...mapGetters(["radarImages", "radarMap", "radarSeason"]),

    parsedRadarMap() {
      if (!this.radarMap) return "";
      return this.radarMap.replace(/\n/gi, "<br/>").replace(/\s/g, "&nbsp;");
    },

    parsedRadarImage() {
      if (!this.visibleRadarImage) return "";
      return this.visibleRadarImage.replace(/\s/g, "&nbsp;");
    },
  },

  mounted() {
    this.$nextTick(() => {
      if (!this.radarMap) return EventBus.emit("radar-complete");
      else this.cycleRadarImages();
    });
  },

  methods: {
    cycleRadarImages() {
      if (!this.radarImages || !this.radarImages.length) return;

      const setRadarImage = () => {
        // set the image and move the ix to the next one
        this.visibleRadarImage = (this.radarImages[this.visibleRadarImageIx] || "").replace(/\n/gi, "<br/>");
        this.visibleRadarImageIx = ++this.visibleRadarImageIx % this.radarImages.length;

        // wait RADAR_IMAGE_VISIBLE_DURATION before showing next image, if we're back to the first one wait 10s
        setTimeout(
          setRadarImage,
          !this.visibleRadarImageIx ? RADAR_IMAGE_VISIBLE_DURATION * 10 : RADAR_IMAGE_VISIBLE_DURATION
        );
      };

      setRadarImage();
    },
  },
};
</script>

<style lang="scss" scoped>
#radar_page {
  flex-direction: column;
  display: flex;
}

#title {
  text-align: center;
  width: 100%;
}

#ascii_radar {
  align-items: center;
  display: flex;
  font-family: consolas;
  font-size: 2px;
  height: 100%;
  line-height: 2px;
  overflow: hidden;
  padding-bottom: 20%;
  position: relative;
  width: 100%;

  #map {
    position: relative;
  }

  #data {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;

    #data_visible_area {
      overflow: hidden;
      position: absolute;
      white-space: nowrap;
      width: 526px;
    }
  }
}
</style>
