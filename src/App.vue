<template>
  <div id="body">
    <div id="main_screen">
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
        <surrounding
          v-if="isSurrounding"
          :observed="weather.observed"
          :timezone="timeZone"
          :observations="weather.surroundingObservations"
        />
        <almanac
          v-if="isAlmanac"
          :city="weather.city"
          :observed="weather.observed"
          :conditions="weather.currentConditions"
          :almanac="weather.almanac"
        />
        <warnings v-if="isWarnings" :city="weather.city" :warnings="weather.warnings" />
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
  WARNINGS: { id: 5, length: 30 },
};
const SCREEN_ROTATION = [
  SCREENS.CURRENT_CONDITIONS,
  SCREENS.WARNINGS,
  SCREENS.FORECAST,
  SCREENS.ALMANAC,
  SCREENS.SURROUNDING,
];

import { format } from "date-fns";
import { EventBus } from "./js/EventBus";
import currentconditions from "./components/currentconditions.vue";
import forecast from "./components/forecast.vue";
import surrounding from "./components/surrounding.vue";
import almanac from "./components/almanac.vue";
import warnings from "./components/warnings.vue";
import playlist from "./components/playlist";
import crawler from "./components/crawler";

export default {
  name: "App",
  components: { currentconditions, forecast, surrounding, almanac, warnings, playlist, crawler },
  data() {
    return {
      screenChanger: null,
      now: new Date(),
      rotationIndex: 0,
      currentScreen: SCREENS.CURRENT_CONDITIONS,
      weather: {
        currentConditions: null,
        city: null,
        observed: null,
        riseSet: null,
        forecast: null,
        surroundingObservations: null,
        almanac: null,
      },
      playlist: [],
      crawlerMessages: [],
    };
  },

  computed: {
    currentTime() {
      return format(this.now, "HH:mm:ss");
    },

    currentDate() {
      return format(this.now, "EEE MMM dd");
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

    isSurrounding() {
      return this.currentScreenID === SCREENS.SURROUNDING.id;
    },

    isAlmanac() {
      return this.currentScreenID === SCREENS.ALMANAC.id;
    },

    isWarnings() {
      return this.currentScreenID === SCREENS.WARNINGS.id;
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
        this.getWeather();
      }, FETCH_WEATHER_INTERVAL);

      this.setupEventCallbacks();
      this.getWeather();
      this.getSurroundingWeather();
      this.handleScreenCycle();
    });
  },

  unmounted() {
    this.destroyEventCallbacks();
  },

  methods: {
    initWeatherChannel(callback) {
      this.$http
        .get("//localhost:8600/api/init")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          if (data.playlist && data.playlist.file_count) this.playlist = data.playlist.files;
          if (data.crawler && data.crawler.message_count) this.crawlerMessages = data.crawler.messages;
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
    },

    destroyEventCallbacks() {
      EventBus.off("forecast-complete");
      EventBus.off("observation-complete");
      EventBus.off("warnings-complete");
    },

    getWeather() {
      this.$http
        .get("//localhost:8600/api/weather")
        .then((resp) => {
          const data = resp.data;
          if (!data) return;

          this.weather.city = data.location && data.location.name && data.location.name.value;
          this.weather.observed = data.observed;
          this.weather.currentConditions = data.current;
          this.weather.riseSet = data.riseSet;
          this.weather.forecast = data.upcomingForecast.slice(0, 5);
          this.weather.almanac = data.almanac;
          this.weather.warnings = data.warnings;
        })
        .catch((err) => {
          console.error(err);
          this.weather = {};
        });
    },

    getSurroundingWeather() {
      this.$http
        .get("//localhost:8600/api/weather/surrounding")
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
