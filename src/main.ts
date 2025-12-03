import { createApp } from "vue";
import { pinia } from "./stores";
import App from "./App.vue";
import "./style.css";
import { useLogStore } from "./stores/logStore";

// Create and mount Vue app
const app = createApp(App);
app.use(pinia);
app.mount("#app");

useLogStore().hijackConsole();