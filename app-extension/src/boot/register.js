import Vue from 'vue'
import VuePlugin from '../../../quasar-ui-histrix-client/src/index.js'
import histrixApi from '../../../quasar-ui-histrix-client/src/services/histrixApi.js'

Vue.directive('histrixApi', histrixApi)
Vue.use(VuePlugin)

