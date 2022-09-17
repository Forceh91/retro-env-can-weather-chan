const { createStore } = require("vuex");
import ecDataGetters from "../src/vuex/getters-ecdata";

const getFreshStore = (data) => {
  return createStore({
    state() {
      return { ecData: { ...data } };
    },

    getters: {
      ...ecDataGetters,
    },
  });
};

module.exports = { getFreshStore };
