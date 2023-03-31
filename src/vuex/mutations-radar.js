export default {
  storeRadarImages(state, images) {
    if (!state.radar) return;

    state.radar.images = images;
  },
};
