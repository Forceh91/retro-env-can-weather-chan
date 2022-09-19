const { createStore } = require("vuex");

import ecDataGetters from "../src/vuex/getters-ecdata";
import ecDataMutations from "../src/vuex/mutations-ecdata";

const getFreshStore = (data) => {
  return createStore({
    state() {
      return { ecData: { ...data } };
    },

    getters: {
      ...ecDataGetters,
    },

    mutations: {
      ...ecDataMutations,
    },
  });
};

module.exports = { getFreshStore };
