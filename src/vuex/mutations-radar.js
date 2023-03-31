export default {
  storeRadarImages(state, images) {
    if (!state.radar) return;

    state.radar.images = images;
  },

  storeRadarMap(state, map) {
    if (!state.radar) return;

    state.radar.map = map;
  },

  storeRadarSeason(state, season) {
    if (!state.radar) return;

    state.radar.season = season;
  },
};
