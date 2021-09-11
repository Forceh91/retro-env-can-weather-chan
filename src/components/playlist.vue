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
    this.setupPlaylist();
  },

  methods: {
    setupPlaylist() {
      if (!this.playlist || !this.playlist.length) return;

      this.selectRandomTrackFromPlaylist();
    },

    selectRandomTrackFromPlaylist() {
      this.currentTrack = null;

      // wait a second for the audio player to be destroyed a rebuilt before
      // moving onto the next track. hopefully this fixes it getting stuck
      setTimeout(() => {
        const rand = Math.floor(1 + Math.random() * this.playlist.length) - 1;
        const selectedTrack = this.playlist[rand];
        if (!selectedTrack) return this.selectRandomTrackFromPlaylist();
        this.currentTrack = selectedTrack;
      }, 1000);
    },
  },
};
</script>
