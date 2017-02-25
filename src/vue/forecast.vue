<template lang="pug">
div
  h2 {{ forecast.summary }}
  i(:class='iconClass(forecast.icon)') &nbsp;
  countup.countup.degree(v-bind:value='forecast.temperature')
</template>

<script>
module.exports = {
  props: ['forecast'],
  components: {
    countup: require('./countup.vue')
  },
  methods: {
    iconClass: function(icon) {
      return 'wi wi-forecast-io-' + icon;
    }
  }
}
</script>
