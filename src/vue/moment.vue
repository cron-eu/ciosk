<template lang="pug">
time(:datetime='time')
  | {{ representation }}
</template>

<script>
var moment = require('moment');

module.exports = {
  props: ['time'],
  data: function() {
    return {
      representation: '',
      timer: null
    }
  },
  methods: {
    moment: function() {
      this.representation = moment(this.time).fromNow();
    }
  },
  mounted: function() {
    this.moment();
    this.timer = setInterval(this.moment.bind(this), 1000);
  },
  beforeDestroy: function() {
    clearIntervall(this.timer);
  }
}
</script>
