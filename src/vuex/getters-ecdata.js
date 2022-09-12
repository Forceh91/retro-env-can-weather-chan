export default {
  ecData: (state) => {
    return state.ecData;
  },

  ecCity: (state) => {
    return state.ecData && state.ecData.city;
  },

  ecObserved: (state) => {
    return state.ecData && state.ecData.observed;
  },

  ecObservedAtStation: (state) => {
    const { observed } = state.ecData || {};
    return observed && { time: observed.stationTime, timezone: observed.stationTimezone };
  },

  ecConditions: (state) => {
    return state.ecData && state.ecData.conditions;
  },

  ecWindchill: (state) => {
    return state.ecData && state.ecData.windchill;
  },

  ecForecast: (state) => {
    return state.ecData && state.ecData.forecast;
  },

  ecShortForecast: (state) => {
    const { forecast } = state.ecData || [];
    return forecast && forecast.slice(0, 5);
  },

  ecAirQuality: (state) => {
    return state.ecData && state.ecData.airQuality;
  },

  ecUUID: (state) => {
    return state.ecData && state.ecData.conditionID;
  },
};
