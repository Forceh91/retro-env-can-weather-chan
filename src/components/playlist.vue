<template>
  <audio
    id="playlist_audio"
    v-if="currentTrack"
    :src="`//localhost:8600/${currentTrack}`"
    autoplay
    volume="0.5"
    @ended="selectRandomTrackFromPlaylist"
    @error="selectRandomTrackFromPlaylist"
  />
</template>

<script>
export default {
  name: "Playlist",
  props: {
    playlist: {
      type: Array,
      default: () => [],
    },
  },

  watch: {
    playlist() {
      this.selectRandomTrackFromPlaylist();
    },
  },

  data() {
    return { currentTrack: null };
  },

  mounted() {
    if (!this.playlist || !this.playlist.length) return;

    this.selectRandomTrackFromPlaylist();
  },

  methods: {
    selectRandomTrackFromPlaylist() {
      this.currentTrack = null;

      const rand = Math.floor(Math.random() * this.playlist.length - 1);
      const selectedTrack = this.playlist[rand];
      if (!selectedTrack) return this.selectRandomTrackFromPlaylist();
      this.currentTrack = selectedTrack;
    },
  },
};
</script>
