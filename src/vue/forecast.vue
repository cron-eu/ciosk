<template lang="pug">
div
  h2 {{ forecast.summary }}
  i(:class='iconClass') &nbsp;
  countup.countup.degree(v-bind:value='forecast.temperature')
</template>

<script>
module.exports = {
  props: ['forecast'],
  components: {
    countup: require('./countup.vue')
  },
  computed: {
    iconClass: function() {
      return 'wi wi-forecast-io-' + this.forecast.icon;
    }
  }
}
</script>
