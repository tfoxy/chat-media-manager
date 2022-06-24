import devtools from "@vue/devtools";
import { createApp } from "vue";
import App from "./App.vue";

if (import.meta.env.DEV) {
  devtools.connect();
}

createApp(App).mount("#app");
