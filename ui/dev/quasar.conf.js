// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

const path = require('node:path');

module.exports = (_ctx) => ({
  // app boot file (/src/boot)
  // --> boot files are part of "main.js"
  boot: ['register.js'],

  css: ['app.sass'],

  extras: [
    // 'ionicons-v4',
    // 'mdi-v5',
    // 'fontawesome-v5',
    // 'eva-icons',
    // 'themify',
    // 'line-awesome',
    // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

    'roboto-font', // optional, you are not bound to it
    'material-icons' // optional, you are not bound to it
  ],

  framework: {
    iconSet: 'material-icons', // Quasar icon set
    lang: 'en-us', // Quasar language pack
    config: {},

    // Possible values for "importStrategy":
    // * 'auto' - (DEFAULT) Auto-import needed Quasar components & directives
    // * 'all'  - Manually specify what to import
    importStrategy: '',

    // Quasar plugins
    plugins: []
  },

  // animations: 'all', // --- includes all animations
  animations: [],

  // Full list of options: https://quasar.dev/quasar-cli/quasar-conf-js#Property%3A-build
  build: {
    vueRouterMode: 'history',

    chainWebpack(chain) {
      chain.resolve.alias.merge({
        ui: path.resolve(__dirname, '../src/index.js')
      });
    }
  },

  devServer: {
    // port: 8080,
    open: true // opens browser window automatically
  }
});
