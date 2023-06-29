<template>
  <div>
    <h4>Playlist</h4>
    <p>
      These are the files that are currently in the channel's playlist. The channel will pickup any <b>.mp3</b> files
      from the <b>./music</b> folder. To update the playlist after adding removing files, use the "Reload Playlist"
      button.
    </p>
    <ul id="playlist" v-if="playlist && playlist.length">
      <li v-for="(file, ix) in playlist" :key="`playlist-item-${ix}`">{{ cleanFileName(file) }}</li>
    </ul>
    <div v-else><b>There are currently no files in the playlist</b></div>
    <b-button class="mt-3" variant="success" @click="reloadPlaylist" :disabled="saveState.saving"
      >Reload Playlist</b-button
    >
  </div>
</template>

<script>
export default {
  name: "playlist-config",

  props: {
    playlist: {
      type: Array,
      default: () => {
        return [];
      },
    },

    saveState: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },

  methods: {
    reloadPlaylist() {
      this.$emit("save");
    },

    cleanFileName(file) {
      return file.replace("./music/", "");
    },
  },
};
</script>

<style lang="scss" scoped>
#playlist {
  display: flex;
  list-style: none;
  padding: 0;

  li {
    &:not(:last-child) {
      margin-right: 10px;
    }

    border: 1px solid #cacaca;
    padding: 5px 10px;
  }
}
</style>
