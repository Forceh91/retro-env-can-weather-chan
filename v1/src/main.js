import { createApp } from "vue";
import axios from "axios";
import VueAxios from "vue-axios";
import BootstrapVue3 from "bootstrap-vue-3";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";

import App from "./App.vue";
import store from "./vuex/store";
import router from "./js/router";

const BASE_URL = `http://${window.location.hostname}`;
const BASE_PORT = window.location.port;
const API_URL = `${BASE_URL}:${BASE_PORT}/`;

const app = createApp(App);
const weatherAxios = axios.create({ baseURL: API_URL });
app.use(VueAxios, weatherAxios);
app.use(store);
app.use(router);
app.use(BootstrapVue3);
app.mount("#app");
