<template>
  <div>
    <router-view v-if="!isWeatherChannel" />
    <div v-else id="weather_channel" :class="{ 'is-vcr': isVCRFont }">
      <div id="main_screen" :style="{ 'background-color': backgroundCol }">
        <div id="top_bar">
          <div v-if="crawlerMessages.length" id="crawler"><crawler :messages="crawlerMessages" /></div>
        </div>
        <div id="content">
          <currentconditions v-if="isCurrentConditions" />
          <forecast v-if="isForecast" :forecast="ecShortForecast" :reload="shouldDoReloadAnimation" />
          <aqhiwarning v-if="isAQHIWarning" :aqhi="ecAirQuality" />
          <outlook v-if="isOutlook" :forecast="ecForecast" :normals="ecRegionalNormals" />
          <mbhighlow v-if="isMBHighLow" :enabled="showMBHighLowSetting" :manitoba-data="province.highLowAroundMB" />
          <surrounding v-if="isSurrounding" :group-by-area="true" :observations="surrounding.canada" />
          <surrounding v-if="isUSSurrounding" :observations="surrounding.usa" />
          <almanac v-if="isAlmanac" :almanac="ecAlmanac" />
          <warnings v-if="isWarnings" :warnings="ecWarnings" />
          <windchill v-if="isWindChillEffects" :windchill-season="season?.isWindchill" />
          <citystats v-if="isCityStats" :season-precip="season?.precip" :is-winter="season?.isWinter" />
          <lastmonth v-if="isLastMonthSummary" :last-month="climate.lastMonth" />
          <infoscreen v-if="isInfoScreen" :info-screens="infoScreens" />
          <sunspots v-if="isSunspots" :sunspot-forecast="sunspotForecast" />
          <Radar v-if="isRadar" />
        </div>
        <div id="bottom_bar">
          <div>
            TIME <span>{{ currentTime }}</span
            >&nbsp;&nbsp;&nbsp;&nbsp;<span v-html="currentDate"></span>
          </div>
          <div id="banner">Environment Canada Weather</div>
        </div>
      </div>
      <playlist :playlist="playlist" />
    </div>
  </div>
</template>

<script>
const FETCH_CONFIG_INTERVAL = 60 * 1000 * 5;
const FETCH_WEATHER_INTERVAL = 60 * 1000 * 1;
const FETCH_EXTRA_DATA_INTERVAL = 60 * 1000 * 10;
const FETCH_RADAR_DATA_INTERVAL = 60 * 1000 * 15;
// pages with subscreens (forecast, surrounding) have a fallback timeout incase
// the subscreens fail to complete correctly
const SCREENS = {
  CURRENT_CONDITIONS: { id: 1, length: 30 },
  FORECAST: { id: 2, length: 160 },
  SURROUNDING: { id: 3, length: 80 },
  ALMANAC: { id: 4, length: 20 },
  WARNINGS: { id: 5, length: 30 * 10 }, // enough for 10 warnings if things get crazy
  WINDCHILL: { id: 6, length: 20 },
  MB_HIGH_LOW: { id: 7, length: 20 },
  CITY_STATS: { id: 8, length: 20 },
  US_SURROUNDING: { id: 9, length: 30 },
  OUTLOOK: { id: 10, length: 20 },
  RANDOM: { id: 11, length: 20 },
  SUMMARY: { id: 12, length: 20 },
  AQHI_WARNING: { id: 13, length: 20 },
  INFO: { id: 14, length: 20 * 25 }, // enough for 25 screens at 20s each
  SUNSPOTS: { id: 15, length: 20 },
  RADAR: { id: 16, length: 51 }, // 21 images at 1 seconds, plus 10s pause.
};
const SCREEN_ROTATION = [
  // SCREENS.CURRENT_CONDITIONS,
  SCREENS.WARNINGS,
  SCREENS.FORECAST,
  SCREENS.OUTLOOK,
  SCREENS.RADAR,
  SCREENS.ALMANAC,
  SCREENS.AQHI_WARNING,
  SCREENS.MB_HIGH_LOW,
  SCREENS.SURROUNDING,
  SCREENS.US_SURROUNDING,
  SCREENS.SUNSPOTS,
  SCREENS.CITY_STATS,
  SCREENS.RANDOM,
  SCREENS.WINDCHILL,
  SCREENS.INFO,
];

const BLUE_COL = "rgb(0,0,135)";
const RED_COL = "#610b00";

import { mapGetters } from "vuex";
import { format, addMinutes /*, formatRFC3339*/ } from "date-fns";
import { EventBus } from "./js/EventBus";
import currentconditions from "./components/currentconditions.vue";
import forecast from "./components/forecast.vue";
import surrounding from "./components/surrounding.vue";
import almanac from "./components/almanac.vue";
import warnings from "./components/warnings.vue";
import windchill from "./components/windchill.vue";
import mbhighlow from "./components/mbhighlow.vue";
import citystats from "./components/citystats.vue";
import playlist from "./components/playlist";
import crawler from "./components/crawler";
import Outlook from "./components/outlook.vue";
import lastmonth from "./components/lastmonth.vue";
import aqhiwarning from "./components/aqhiwarning.vue";
import infoscreen from "./components/infoscreen.vue";
import sunspots from "./components/sunspots.vue";
import Radar from "./components/radar.vue";

export default {
  name: "App",
  components: {
    currentconditions,
    forecast,
    surrounding,
    almanac,
    warnings,
    windchill,
    mbhighlow,
    citystats,
    playlist,
    crawler,
    Outlook,
    lastmonth,
    aqhiwarning,
    infoscreen,
    sunspots,
    Radar,
  },
  data() {
    return {
      screenChanger: null,
      now: new Date(),
      rotationIndex: 1,
      currentScreen: SCREENS.FORECAST,
      province: {
        highLowAroundMB: {},
      },
      surrounding: {
        canada: null,
        usa: null,
      },
      sunspotForecast: [],
      season: {
        precip: null,
        isWinter: false,
        isWindchill: false,
      },
      climate: {
        lastMonth: false,
      },
      playlist: [],
      crawlerMessages: [],
      showMBHighLowSetting: false,
      infoScreens: [],
      backgroundCol: BLUE_COL,
      backgroundColDebouncer: null,
      shouldDoReloadAnimation: false,
      lookAndFeelConfig: null,

      // real-time condition updates
      weatherEventSource: null,
    };
  },

  watch: {
    rotationIndex() {
      this.switchBackgroundColour();
    },

    ecUUID(val, old) {
      if (old) this.forceReloadForNewData();
    },
  },

  computed: {
    currentTime() {
      return format(this.timezoneAdjustedDate(this.now), "HH:mm:ss");
    },

    currentDate() {
      const dateString = format(this.timezoneAdjustedDate(this.now), "EEE'&nbsp;' MMM'&nbsp;' dd");
      return dateString
        .replace(/tue&nbsp;/gi, "tues")
        .replace(/thu&nbsp;/gi, "thur")
        .replace(/jun&nbsp;/gi, "june")
        .replace(/jul&nbsp;/gi, "july")
        .replace(/sep&nbsp;/gi, "sept")
        .replace(/\s0/, "&nbsp;&nbsp;");
    },

    currentScreenID() {
      return this.currentScreen.id;
    },

    currentScreenTimeout() {
      return this.currentScreen.length;
    },

    isCurrentConditions() {
      return this.currentScreenID === SCREENS.CURRENT_CONDITIONS.id;
    },

    isForecast() {
      return this.currentScreenID === SCREENS.FORECAST.id;
    },

    isOutlook() {
      return this.currentScreenID === SCREENS.OUTLOOK.id;
    },

    isSurrounding() {
      return this.currentScreenID === SCREENS.SURROUNDING.id;
    },

    isUSSurrounding() {
      return this.currentScreenID === SCREENS.US_SURROUNDING.id;
    },

    isAlmanac() {
      return this.currentScreenID === SCREENS.ALMANAC.id;
    },

    isWarnings() {
      return this.currentScreenID === SCREENS.WARNINGS.id;
    },

    isWindChillEffects() {
      return this.currentScreenID === SCREENS.WINDCHILL.id;
    },

    isMBHighLow() {
      return this.currentScreenID === SCREENS.MB_HIGH_LOW.id;
    },

    isCityStats() {
      return this.currentScreenID === SCREENS.CITY_STATS.id;
    },

    isLastMonthSummary() {
      return this.currentScreenID === SCREENS.SUMMARY.id;
    },

    isAQHIWarning() {
      return this.currentScreenID === SCREENS.AQHI_WARNING.id;
    },

    isInfoScreen() {
      return this.currentScreenID === SCREENS.INFO.id;
    },

    isSunspots() {
      return this.currentScreenID === SCREENS.SUNSPOTS.id;
    },

    isRadar() {
      return this.currentScreenID === SCREENS.RADAR.id;
    },

    timeZone() {
      return this.ecData?.observed?.stationTimezone || null;
    },

    stationOffsetMinutesFromLocal() {
      return this.ecData?.observed?.stationOffsetMinutesFromLocal || 0;
    },

    isWeatherChannel() {
      return this.$route.path === "/";
    },

    isVCRFont() {
      return this.lookAndFeelConfig?.font === "vcr";
    },

    // data returned from eccc
    ...mapGetters([
      "ecData",
      "ecForecast",
      "ecRegionalNormals",
      "ecShortForecast",
      "ecWindchill",
      "ecAirQuality",
      "ecAlmanac",
      "ecWarnings",
      "ecUUID",
    ]),
  },

  mounted() {
    if (!this.isWeatherChannel) return;

    setInterval(() => {
      this.now = new Date();
    }, 1000);

    this.initWeatherChannel(() => {
      setInterval(() => {
        this.getSurroundingWeather();
        this.getSurroundingUSWeather();
        this.getSunspotForecast();
        this.getWarnings();
        if (this.showMBHighLowSetting) this.getHighLowAroundMB();
      }, FETCH_WEATHER_INTERVAL);

      setInterval(() => {
        this.getSeasonPrecipData();
        this.getLastMonthSummary();
      }, FETCH_EXTRA_DATA_INTERVAL);

      setInterval(() => {
        this.getRadar();
      }, FETCH_RADAR_DATA_INTERVAL);

      // reload the config every FETCH_CONFIG_INTERVAL
      setInterval(() => {
        this.initWeatherChannel();
      }, FETCH_CONFIG_INTERVAL);

      this.setupEventCallbacks();
      this.getWeather();
      this.getSurroundingWeather();
      this.getSurroundingUSWeather();
      this.getSunspotForecast();
      this.getSeasonPrecipData();
      this.getLastMonthSummary();
      this.getWarnings();
      this.getRadarMap();
      this.getRadar();
      if (this.showMBHighLowSetting) this.getHighLowAroundMB();
      this.handleScreenCycle();
    });
  },

  unmounted() {
    this.destroyEventCallbacks();
  },

  methods: {
    initWeatherChannel(callback) {
      this.$http
        .get("api/init")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          if (data.playlist && data.playlist.file_count) this.playlist = data.playlist.files;
          if (data.crawler && data.crawler.message_count) this.crawlerMessages = data.crawler.messages;
          if (data.showMBHighLow) this.showMBHighLowSetting = data.showMBHighLow;
          if (data.infoScreens) this.infoScreens = data.infoScreens;
          if (data.lookAndFeel) this.lookAndFeelConfig = data.lookAndFeel;
          if (typeof callback === "function") callback();
        })
        .catch(() => {
          console.warn("Unable to initalize channel from server");
        });
    },

    setupEventCallbacks() {
      EventBus.on("forecast-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("observation-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("warnings-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("windchill-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("mbhighlow-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("aqhi-not-needed", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("info-screens-complete", () => {
        this.handleScreenCycle(true);
      });

      EventBus.on("sunspots-complete", () => {
        this.handleScreenCycle(true);
      });
    },

    destroyEventCallbacks() {
      EventBus.off("forecast-complete");
      EventBus.off("observation-complete");
      EventBus.off("warnings-complete");
      EventBus.off("windchill-complete");
      EventBus.off("mbhighlow-complete");
      EventBus.off("aqhi-not-needed");
      EventBus.off("info-screens-complete");
      EventBus.off("sunspots-complete");
    },

    getWeather() {
      // make sure we don't oversubscribe
      if (this.weatherEventSource) return;

      // setup the event source
      this.weatherEventSource = new EventSource("api/weather/live");
      if (!this.weatherEventSource) return;

      // listen for condition updates
      this.weatherEventSource.addEventListener("condition_update", (weatherData) => {
        const jsonData = JSON.parse(weatherData.data);
        if (!jsonData) return;

        this.$store.commit("storeECData", jsonData);
        this.season.isWindchill = jsonData?.isWindchillSeason;
      });
    },

    _getWeather() {
      this.$http
        .get("api/weather")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.$store.commit("storeECData", data);
          this.season.isWindchill = data?.isWindchillSeason;
        })
        .catch((err) => {
          console.error(err);
          this.weather = {};
        });
    },

    getSurroundingWeather() {
      this.$http
        .get("api/weather/surrounding")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.observations || !data.observations.length) return;

          this.surrounding.canada = data.observations;
        })
        .catch((err) => {
          console.error(err);
          this.surrounding.canada = null;
        });
    },

    getSurroundingUSWeather() {
      this.$http
        .get("api/weather/usa")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.observations || !data.observations.length) return;

          this.surrounding.usa = data.observations;
        })
        .catch((err) => {
          console.error(err);
          this.surrounding.usa = null;
        });
    },

    getSunspotForecast() {
      this.$http
        .get("api/weather/sunspot")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.sunspots) return;

          this.sunspotForecast = data.sunspots;
        })
        .catch((err) => {
          console.error(err);
          this.surrounding.usa = null;
        });
    },

    getHighLowAroundMB() {
      if (!this.showMBHighLowSetting) return;

      this.$http
        .get("api/weather/mb_highlow")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.stations || !data.stations.length) return;

          this.province.highLowAroundMB = data;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    getSeasonPrecipData() {
      this.$http
        .get("/api/climate/season/precip")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.normalPrecip) return;

          this.season.precip = data;
          this.season.isWinter = data.isWinter;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    getLastMonthSummary() {
      this.$http
        .get("/api/climate/lastmonth")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.summary) return (this.climate.lastMonth = false);

          this.climate.lastMonth = data.summary;
        })
        .catch((err) => {
          console.error(err);
        });
    },

    getWarnings() {
      this.$http.get("/api/warnings").then((resp) => {
        const data = resp.data;
        if (!data || !data.warnings) return;

        this.$store.commit("storeECWarnings", data.warnings);
      });
    },

    getRadarMap() {
      this.$http.get("/api/radar/map").then((resp) => {
        const { data } = resp;
        if (!data) return;

        this.$store.commit("storeRadarMap", data.map);
      });
    },

    getRadar() {
      this.$http.get("/api/radar").then((resp) => {
        const { data } = resp;
        if (!data) return;
        this.$store.commit("storeRadarImages", (data.images || []).reverse());
        this.$store.commit("storeRadarSeason", data.season);
      });
    },

    handleScreenCycle(isForced) {
      if (isForced) this.switchToNextScreen();
      if (this.screenChanger) clearTimeout(this.screenChanger);

      this.screenChanger = setTimeout(() => {
        this.switchToNextScreen();
      }, this.currentScreenTimeout * 1000);
    },

    switchToNextScreen() {
      this.shouldDoReloadAnimation = false;

      this.rotationIndex += 1;
      if (this.rotationIndex === SCREEN_ROTATION.length) this.rotationIndex = 0;
      this.currentScreen = SCREEN_ROTATION[this.rotationIndex];

      // if its a random extra screen then decide what to throw in
      if (this.currentScreenID === SCREENS.RANDOM.id) {
        // available screens are... LAST MONTH SUMMARY (if data is there)
        const availableScreens = [];
        if (this.climate.lastMonth) availableScreens.push(SCREENS.SUMMARY);
        if (!availableScreens) return this.switchToNextScreen();

        // pick a random screen from that
        const randomScreen = availableScreens[Math.floor(Math.random() * availableScreens.length)];
        if (!randomScreen) return this.switchToNextScreen();
        this.currentScreen = randomScreen;
      }

      this.handleScreenCycle();
    },

    switchBackgroundColour() {
      if (this.backgroundColDebouncer) return;

      this.backgroundColDebouncer = setTimeout(() => {
        if (this.backgroundCol !== BLUE_COL) this.backgroundCol = BLUE_COL;
        else this.backgroundCol = RED_COL;
        this.backgroundColDebouncer = null;
      }, 50);
    },

    forceReloadForNewData() {
      // set stuff back to the forecast page
      this.rotationIndex = 1;
      this.currentScreen = SCREEN_ROTATION[this.rotationIndex];
      this.shouldDoReloadAnimation = true;

      // handle stuff as usual
      this.handleScreenCycle();
    },

    timezoneAdjustedDate(date) {
      return addMinutes(date, this.stationOffsetMinutesFromLocal);
    },
  },
};
</script>

<style lang="scss" scoped>
#body {
  align-items: center;
  display: flex;
  height: 100vh;
  justify-content: center;
  width: 100vw;
}

#main_screen {
  background: darkblue;
  color: #fff;
  height: 480px;
  position: relative;
  text-transform: uppercase;
  width: 640px;

  #top_bar {
    align-items: flex-end;
    background: rgb(22, 90, 22);
    display: flex;
    font-size: 24px;
    height: 75px;
    overflow: hidden;
    padding: 10px 50px;
    width: 100%;

    #header {
      width: 50%;
    }

    #code {
      text-align: right;
      width: 100%;
    }
  }

  #content {
    top: 100px;
    display: flex;
    height: calc(100% - 175px);
    justify-content: center;
    padding: 10px;
    width: 100%;
  }

  #bottom_bar {
    align-items: flex-start;
    background: rgb(22, 90, 22);
    display: flex;
    flex-wrap: wrap;
    height: 100px;
    justify-content: center;
    padding: 10px 20%;
    width: 100%;

    #banner {
      text-align: center;
      width: 100%;
    }

    #clock,
    #date {
      text-align: center;
      width: 50%;
    }
  }
}

@font-face {
  font-family: "vt323";
  font-weight: 400;
  src: local("vt323"), url(./fonts/vt323/VT323-Regular.ttf) format("truetype");
}

@font-face {
  font-family: "vcr mono";
  font-weight: 400;
  src: local("vcr mono"), url(./fonts/vcr-mono/VCR_OSD_MONO_1.001.ttf) format("truetype");
}

#weather_channel {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #000;
  font-family: "vt323", consolas;
  font-weight: 400;
  font-size: 30px;
  height: 100vh;
  line-height: 1;
  width: 100vw;

  &.is-vcr {
    font-family: "vcr mono", consolas;
    font-size: 21px;

    #top_bar {
      font-size: 15px;
    }
  }
}
</style>

<style>
body {
  margin: 0;
}

* {
  box-sizing: border-box;
  border: 0;
  outline: none;
  padding: 0;
}

/* @font-face {
  font-family: "Star4000";
  src: local("Star4000"), url(./fonts/star4000/Star4000.ttf) format("truetype");
} */
</style>
