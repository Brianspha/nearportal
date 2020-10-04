import Vue from "vue"
import App from "./App.vue"
import store from './store/'
import { initContract } from "./utils"
import vuetify from './plugins/vuetify';

Vue.config.productionTip = false
window.nearInitPromise = initContract()
  .then(() => {
    new Vue({
      vuetify,
      store,
      render: h => h(App)
    }).$mount("#app")

  })
  