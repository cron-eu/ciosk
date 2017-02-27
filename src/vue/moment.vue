<template lang="pug">
time(:datetime='time')
  | {{ representation }}
</template>

<script>
var moment = require('moment');

module.exports = {
  props: ['time', 'representation'],
  methods: {
    moment: function() {
      this.representation = moment(this.time).fromNow();
      setInterval(this.moment.bind(this), 1000);
    }
  },
  mounted: function() {
    this.moment();
  }
}
</script>
