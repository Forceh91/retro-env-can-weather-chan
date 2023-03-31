import { createStore } from "vuex";
import ecDataStore from "./store-ecdata";
import ecDataMutations from "./mutations-ecdata";
import ecDataGetters from "./getters-ecdata";
import warningsStore from "./store-warnings";
import warningsMutations from "./mutations-warnings";
import warningsGetters from "./getters-warnings";
import radarStore from "./store-radar";
import radarMutations from "./mutations-radar";
import radarGetters from "./getters-radar";

// ec refers to data returned from ECCC for the current conditions
const store = createStore({
  state() {
    return { ...ecDataStore, ...warningsStore, ...radarStore };
  },

  mutations: {
    ...ecDataMutations,
    ...warningsMutations,
    ...radarMutations,
  },

  getters: {
    ...ecDataGetters,
    ...warningsGetters,
    ...radarGetters,
  },
});

export default store;
