<script>
var CountUp = require('countup.js');
module.exports = {
  props: ['value'],
  template: '<span></span>',
  mounted: function() {
    this.countUp = new CountUp(this.$el, 0, this.value, 0, 2, {
      separator: ''
    });
    this.countUp.start();
  },
  watch: {
    value: function() {
      this.countUp.update(this.value);
    }
  }
}
</script>
