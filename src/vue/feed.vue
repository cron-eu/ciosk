<template lang="pug">
ul.collection
  li.collection-item.avatar(v-for='item in items')
    img.circle(:src='item.avatar', :alt='item.author')
    moment.title(v-bind:time='item.time')
    p {{ item.title }}
</template>
<script>
module.exports = {
  props: ['items'],
  components: {
    moment: require('./moment.vue')
  }
}
</script>
