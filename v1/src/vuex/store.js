import { createStore } from "vuex";
import ecDataStore from "./store-ecdata";
import ecDataMutations from "./mutations-ecdata";
import ecDataGetters from "./getters-ecdata";
import warningsStore from "./store-warnings";
import warningsMutations from "./mutations-warnings";
import warningsGetters from "./getters-warnings";

// ec refers to data returned from ECCC for the current conditions
const store = createStore({
  state() {
    return { ...ecDataStore, ...warningsStore };
  },

  mutations: {
    ...ecDataMutations,
    ...warningsMutations,
  },

  getters: {
    ...ecDataGetters,
    ...warningsGetters,
  },
});

export default store;
