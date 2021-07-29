<template>
  <div id="body">
    <div id="main_screen">
      <div id="top_bar"></div>
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
import { format } from "date-fns";

export default {
  name: "App",
  components: {},
  data() {
    return {
      now: new Date(),
    };
  },

  mounted() {
    setInterval(() => {
      this.now = new Date();
    }, 1000);
  },

  computed: {
    currentTime() {
      return format(this.now, "HH:mm:ss");
    },

    currentDate() {
      return format(this.now, "EEE    MMM dd");
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
    top: 0;
    display: flex;
    height: 100px;
    justify-content: center;
    padding: 10px;
    position: absolute;
    width: 100%;
  }

  #bottom_bar {
    align-items: flex-start;
    background: rgb(22, 90, 22);
    bottom: 0;
    display: flex;
    flex-wrap: wrap;
    height: 100px;
    justify-content: center;
    padding: 10px 20%;
    position: absolute;
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
