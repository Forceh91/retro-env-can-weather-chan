<template>
  <div id="body">
    <div id="main_screen" :style="{ 'background-color': backgroundCol }">
      <div id="top_bar">
        <div v-if="crawlerMessages.length" id="crawler"><crawler :messages="crawlerMessages" /></div>
      </div>
      <div id="content">
        <currentconditions
          v-if="isCurrentConditions"
          :city="weather.city"
          :observed="weather.observed"
          :conditions="weather.currentConditions"
          :riseset="weather.riseSet"
        />
        <forecast
          v-if="isForecast"
          :city="weather.city"
          :observed="weather.observed"
          :conditions="weather.currentConditions"
          :forecast="weather.forecast"
        />
        <mbhighlow
          v-if="isMBHighLow"
          :enabled="showMBHighLowSetting"
          :data="weather.highLowAroundMB.values"
          :tempclass="weather.highLowAroundMB.tempClass"
          :timezone="timeZone"
        />
        <surrounding
          v-if="isSurrounding"
          :observed="weather.observed"
          :timezone="timeZone"
          :observations="weather.surroundingObservations"
        />
        <surrounding
          v-if="isUSSurrounding"
          :observed="weather.observed"
          :timezone="timeZone"
          :observations="weather.surroundingUSObservations"
        />
        <almanac
          v-if="isAlmanac"
          :city="weather.city"
          :observed="weather.observed"
          :conditions="weather.currentConditions"
          :almanac="weather.almanac"
          :last-year="weather.lastYear"
        />
        <warnings v-if="isWarnings" :city="weather.city" :warnings="weather.warnings" />
        <windchill v-if="isWindChillEffects" :temp="currentTemp" />
        <citystats v-if="isCityStats" :city="weather.city" :riseset="weather.riseSet" :hotcold="weather.hotColdSpots" />
      </div>
      <div id="bottom_bar">
        <div id="clock">
          TIME <span>{{ currentTime }}</span>
        </div>
        <div id="date">{{ currentDate }}</div>
        <div id="banner">Environment Canada Weather</div>
      </div>
    </div>
    <playlist :playlist="playlist" />
  </div>
</template>

<script>
const FETCH_WEATHER_INTERVAL = 60 * 1000 * 1;
// pages with subscreens (forecast, surrounding) have a fallback timeout incase
// the subscreens fail to complete correctly
const SCREENS = {
  CURRENT_CONDITIONS: { id: 1, length: 30 },
  FORECAST: { id: 2, length: 160 },
  SURROUNDING: { id: 3, length: 80 },
  ALMANAC: { id: 4, length: 30 },
  WARNINGS: { id: 5, length: 65 * 10 }, // enough for 10 warnings if things get crazy
  WINDCHILL: { id: 6, length: 20 },
  MB_HIGH_LOW: { id: 7, length: 20 },
  CITY_STATS: { id: 8, length: 20 },
  US_SURROUNDING: { id: 9, length: 30 },
};
const SCREEN_ROTATION = [
  // SCREENS.CURRENT_CONDITIONS,
  SCREENS.FORECAST,
  SCREENS.CITY_STATS,
  SCREENS.WARNINGS,
  SCREENS.WINDCHILL,
  SCREENS.MB_HIGH_LOW,
  SCREENS.ALMANAC,
  SCREENS.SURROUNDING,
  SCREENS.US_SURROUNDING,
];

const BLUE_COL = "rgb(0,0,135)";
const RED_COL = "#610b00";

import { format, addMinutes, formatRFC3339 } from "date-fns";
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
  },
  data() {
    return {
      screenChanger: null,
      now: new Date(),
      rotationIndex: 0,
      currentScreen: SCREENS.FORECAST,
      weather: {
        currentConditions: null,
        city: null,
        observed: null,
        riseSet: null,
        forecast: null,
        surroundingObservations: null,
        surroundingUSObservations: null,
        almanac: null,
        highLowAroundMB: {},
        hotColdSpots: {},
        lastYear: {},
      },
      playlist: [],
      crawlerMessages: [],
      showMBHighLowSetting: false,
      backgroundCol: BLUE_COL,
      backgroundColDebouncer: null,
    };
  },

  watch: {
    rotationIndex() {
      this.switchBackgroundColour();
    },
  },

  computed: {
    currentTime() {
      return format(this.timezoneAdjustedDate(this.now), "HH:mm:ss");
    },

    currentDate() {
      return format(this.timezoneAdjustedDate(this.now), "EEE MMM dd");
    },

    currentScreenID() {
      return this.currentScreen.id;
    },

    currentScreenTimeout() {
      return this.currentScreen.length;
    },

    currentTemp() {
      return Math.round(this.weather?.currentConditions?.temperature?.value) || 0;
    },

    isCurrentConditions() {
      return this.currentScreenID === SCREENS.CURRENT_CONDITIONS.id;
    },

    isForecast() {
      return this.currentScreenID === SCREENS.FORECAST.id;
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

    timeZone() {
      return this.weather.currentConditions?.dateTime[1]?.zone || "";
    },

    reportingStation() {
      return this.weather.currentConditions?.station?.code;
    },
  },

  mounted() {
    setInterval(() => {
      this.now = new Date();
    }, 1000);

    this.initWeatherChannel(() => {
      setInterval(() => {
        this.getSurroundingWeather();
        this.getSurroundingUSWeather();
        this.getWeather();
        if (this.showMBHighLowSetting) this.getHighLowAroundMB();
      }, FETCH_WEATHER_INTERVAL);

      this.setupEventCallbacks();
      this.getWeather();
      this.getSurroundingWeather();
      this.getSurroundingUSWeather();
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
    },

    destroyEventCallbacks() {
      EventBus.off("forecast-complete");
      EventBus.off("observation-complete");
      EventBus.off("warnings-complete");
      EventBus.off("windchill-complete");
    },

    getWeather() {
      this.$http
        .get("api/weather")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.weather.city = data.location && data.location.name && data.location.name.value;
          this.weather.currentConditions = data.current;
          this.weather.riseSet = data.riseSet;
          this.weather.forecast = data.upcomingForecast.slice(0, 5);
          this.weather.almanac = data.almanac;
          this.weather.warnings = data.warnings;
          this.weather.observed = formatRFC3339(this.timezoneAdjustedDate(new Date(data.observed)));
          this.weather.lastYear = data.last_year || {};
          this.weather.hotColdSpots = data.hot_cold || {};
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

          this.weather.surroundingObservations = data.observations;
        })
        .catch((err) => {
          console.error(err);
          this.weather.surroundingObservations = null;
        });
    },

    getSurroundingUSWeather() {
      this.$http
        .get("api/weather/usa")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.observations || !data.observations.length) return;

          this.weather.surroundingUSObservations = data.observations;
        })
        .catch((err) => {
          console.error(err);
          this.weather.surroundingUSObservations = null;
        });
    },

    getHighLowAroundMB() {
      if (!this.showMBHighLowSetting) return;

      this.$http
        .get("api/weather/mb_highlow")
        .then((resp) => {
          const data = resp.data;
          if (!data || !data.values || !data.values.length) return;

          this.weather.highLowAroundMB = data;
        })
        .catch((err) => {
          console.error(err);
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
      this.rotationIndex += 1;
      if (this.rotationIndex === SCREEN_ROTATION.length) this.rotationIndex = 0;
      this.currentScreen = SCREEN_ROTATION[this.rotationIndex];
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

    timezoneAdjustedDate(date) {
      if (!this.weather || !this.weather.currentConditions) return date;
      const localOffset = -date.getTimezoneOffset();
      const stationUTCOffset = parseInt(this.weather.currentConditions.dateTime[1].UTCOffset) * 60;
      const adjustedTime = stationUTCOffset - localOffset;

      return addMinutes(date, adjustedTime);
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
  font-size: 21px;
  position: relative;
  text-transform: uppercase;
  width: 640px;

  #top_bar {
    align-items: flex-end;
    background: rgb(22, 90, 22);
    display: flex;
    font-size: 15px;
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
    line-height: 1.6rem;
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

@font-face {
  font-family: "VCRMono";
  src: local("VCRMono"), url(./fonts/vcr-mono/VCR_OSD_MONO_1.001.ttf) format("truetype");
}

#app {
  background: #000;
  /* font-family: "Star4000", consolas; */
  font-family: "VCRMono", consolas;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
}
</style>
