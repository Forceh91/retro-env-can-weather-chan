import { createStore } from "vuex";
import ecDataStore from "./store-ecdata";
import ecDataMutations from "./mutations-ecdata";
import ecDataGetters from "./getters-ecdata";

// ec refers to data returned from ECCC for the current conditions
const store = createStore({
  state() {
    return { ...ecDataStore };
  },

  mutations: {
    ...ecDataMutations,
  },

  getters: {
    ...ecDataGetters,
  },
});

export default store;
