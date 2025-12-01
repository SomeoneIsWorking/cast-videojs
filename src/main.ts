import { createApp } from "vue";
import { pinia } from "./stores";
import App from "./App.vue";
import "./style.css";
import "video.js/dist/video-js.css";

// Create and mount Vue app
const app = createApp(App);
app.use(pinia);
app.mount("#app");
