const fs = require("fs");

const MUSIC_FOLDER = "./music";
let playlistArray = [];

const generatePlaylist = (callback) => {
  function doCallback(v) {
    if (typeof callback === "function") callback(v);
  }

  console.log("Generating playlist from `music` folder...");

  fs.stat(MUSIC_FOLDER, (err, stat) => {
    if (err) {
      console.log("No playlist needs generating");
      doCallback(false);
    } else {
      fs.readdir(MUSIC_FOLDER, (err, files) => {
        if (err) {
          doCallback();
          console.log("Unable to generate playlist");
        }
        playlistArray = files.filter((f) => f.endsWith(".mp3")).map((f) => `${MUSIC_FOLDER}/${f}`);
        console.log("Generated a playlist of", playlistArray.length, "files...");
        doCallback(playlistArray);
      });
    }
  });
};

const reloadPlaylist = (callback) => {
  console.log("[PLAYLIST] Regenerating playlist from `music` folder...");

  generatePlaylist((result) => {
    if (typeof callback === "function") callback(result);
  });
};

module.exports = {
  generatePlaylist,
  reloadPlaylist,

  getPlaylist() {
    return playlistArray || [];
  },
};
