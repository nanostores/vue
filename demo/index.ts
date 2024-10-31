import { createApp } from "vue";

import { devtools } from "../devtools/index.js";
import App from "./components/App.vue";
import { $atom, $deepMap, $map } from "./stores.js";

const app = createApp(App)

app.use(devtools, {
  $atom,
  $deepMap,
  $map
})

app.mount('#app')
