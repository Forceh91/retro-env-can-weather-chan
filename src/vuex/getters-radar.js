export default {
  radarImages: (state) => {
    return state.radar && state.radar.images;
  },

  radarMap: (state) => {
    return state.radar.map;
  },
};
