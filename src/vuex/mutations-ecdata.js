export default {
  storeECData(state, ecData) {
    state.ecData = ecData;
  },

  setObservedStationTime(state, timeString) {
    if (!state.ecData || !state.ecData.observed) return;

    state.ecData.observed.stationTime = timeString;
  },

  setCurrentConditions(state, conditionString) {
    if (!state.ecData || !state.ecData.conditions) return;

    state.ecData.conditions.condition = conditionString;
  },

  setCurrentTemperature(state, temperature) {
    if (!state.ecData || !state.ecData.conditions || !state.ecData.conditions.temperature) return;

    state.ecData.conditions.temperature.value = temperature;
  },

  setCurrentWind(state, wind) {
    const { speed, gust, direction } = wind || {};
    if (!state.ecData || !state.ecData.conditions || !state.ecData.conditions.wind) return;

    state.ecData.conditions.wind.speed.value = speed;
    state.ecData.conditions.wind.gust.value = gust;
    if (direction) state.ecData.conditions.wind.direction = direction;
  },

  setCurrentHumidity(state, humidity) {
    if (!state.ecData || !state.ecData.conditions || !state.ecData.conditions.relativeHumidity) return;

    state.ecData.conditions.relativeHumidity.value = humidity;
  },

  setCurrentPressure(state, pressure) {
    const { value, tendency } = pressure || {};
    if (!state.ecData || !state.ecData.conditions || !state.ecData.conditions.pressure) return;

    state.ecData.conditions.pressure.value = value;
    if (tendency) state.ecData.conditions.pressure.tendency = tendency;
  },

  setCurrentVisibility(state, visibility) {
    if (!state.ecData || !state.ecData.conditions || !state.ecData.conditions.visibility) return;

    state.ecData.conditions.visibility.value = visibility;
  },

  setWindchill(state, windchill) {
    if (!state.ecData) return;

    state.ecData.windchill = windchill;
  },

  setAirQuality(state, aqhi) {
    if (!state.ecData) return;

    state.ecData.airQuality = aqhi;
  },
};
