<template>
  <div id="body">
    <div id="main_screen">
      <div id="top_bar"></div>
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
      </div>
      <div id="bottom_bar">
        <div id="clock">
          TIME <span>{{ currentTime }}</span>
        </div>
        <div id="date">{{ currentDate }}</div>
        <div id="banner">Environment Canada Weather</div>
      </div>
    </div>
  </div>
</template>

<script>
const FETCH_WEATHER_INTERVAL = 60 * 1000 * 1;
const SCREENS = { CURRENT_CONDITIONS: { id: 1, length: 30 }, FORECAST: { id: 2, length: 160 } };
const SCREEN_ROTATION = [SCREENS.CURRENT_CONDITIONS, SCREENS.FORECAST];

import { format } from "date-fns";
import { EventBus } from "./js/EventBus";
import currentconditions from "./components/currentconditions.vue";
import forecast from "./components/forecast.vue";

export default {
  name: "App",
  components: { currentconditions, forecast },
  data() {
    return {
      screenChanger: null,
      now: new Date(),
      rotationIndex: 0,
      currentScreen: SCREENS.CURRENT_CONDITIONS,
      weather: {
        currentConditions: null,
      },
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
  },

  mounted() {
    setInterval(() => {
      this.now = new Date();
    }, 1000);

    setInterval(() => {
      this.getWeather();
    }, FETCH_WEATHER_INTERVAL);

    this.setupEventCallbacks();
    this.getWeather();
    this.handleScreenCycle();
  },

  unmounted() {
    this.destroyEventCallbacks();
  },

  methods: {
    setupEventCallbacks() {
      EventBus.on("forecast-complete", () => {
        this.handleScreenCycle(true);
      });
    },

    destroyEventCallbacks() {
      EventBus.off("forecast-complete");
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
        })
        .catch((err) => {
          console.error(err);
          this.weather = {};
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
  font-size: 20px;
  position: relative;
  text-transform: uppercase;
  width: 640px;

  #top_bar {
    align-items: flex-end;
    background: rgb(22, 90, 22);
    display: flex;
    height: 100px;
    justify-content: center;
    padding: 10px;
    width: 100%;
  }

  #content {
    top: 100px;
    display: flex;
    height: calc(100% - 200px);
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

#app {
  background: #000;
  font-family: consolas;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  height: 100vh;
  width: 100vw;
}
</style>
