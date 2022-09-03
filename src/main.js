import { createApp } from "vue";
import App from "./App.vue";
import axios from "axios";
import VueAxios from "vue-axios";

const BASE_URL = `http://${window.location.hostname}`;
const BASE_PORT = window.location.port;
const API_URL = `${BASE_URL}:${BASE_PORT}/`;

const app = createApp(App);
const weatherAxios = axios.create({ baseURL: API_URL });
app.use(VueAxios, weatherAxios);
app.mount("#app");
