const { createStore } = require("vuex");

import ecDataGetters from "../src/vuex/getters-ecdata";
import ecDataMutations from "../src/vuex/mutations-ecdata";
import ecWarningsGetters from "../src/vuex/getters-warnings";

const getFreshStore = (data) => {
  return createStore({
    state() {
      return { ecData: { ...data } };
    },

    getters: {
      ...ecDataGetters,
      ...ecWarningsGetters,
    },

    mutations: {
      ...ecDataMutations,
    },
  });
};

module.exports = { getFreshStore };
