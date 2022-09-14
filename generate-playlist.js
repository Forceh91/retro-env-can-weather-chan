const fs = require("fs");

const MUSIC_FOLDER = "./music";
let playlistArray = [];

module.exports = {
  generatePlaylist: () => {
    console.log("Generating playlist from `music` folder...");

    fs.stat(MUSIC_FOLDER, (err, stat) => {
      if (err) console.log("No playlist needs generating");
      else {
        fs.readdir(MUSIC_FOLDER, (err, files) => {
          if (err) console.log("Unable to generate playlist");
          playlistArray = files.filter((f) => f.endsWith(".mp3")).map((f) => `${MUSIC_FOLDER}/${f}`);
          console.log("Generated a playlist of", playlistArray.length, "files...");
        });
      }
    });
  },

  getPlaylist() {
    return playlistArray || [];
  },
};
