import App from "../App";
import Config from "../config/config";
import { createRouter, createWebHashHistory } from "vue-router";

const routes = [
  { path: "/", component: App, name: "weather-channel" },
  { path: "/config", component: Config, name: "config" },
];

// 3. Create the router instance and pass the `routes` option
// You can pass in additional options here, but let's
// keep it simple for now.
const router = createRouter({
  // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
  history: createWebHashHistory(),
  routes, // short for `routes: routes`
});

export default router;
