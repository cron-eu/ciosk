<template lang="pug">
div
  h2
    i(:class='iconClass') &nbsp;
    | {{ mopidy.state }} / Vol {{ mopidy.volume }}
  h3(v-if='mopidy.track')
    | {{ mopidy.track.name }}
    br
    | by {{ mopidy.track.artists.map(function(artist) { return artist.name; }).join(', ') }}
  h3(v-else='')
    | No track in tracklist
</template>

<script>
module.exports = {
  props: ['mopidy'],
  computed: {
    iconClass: function() {
      return this.mopidy.track && this.mopidy.state === 'playing' ? 'fa fa-volume-up' : 'fa fa-volume-off';
    }
  }
}
</script>
