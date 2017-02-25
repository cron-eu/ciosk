var Vue = require('vue')
require('./scss/app.scss')
var App = require('./vue/app.vue')

Vue({
  el: '#dashboard',
  render: function (h) {
    return h(App)
  }
})
