export default [
  {
    day: "wednesday night",
    textSummary:
      "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening. Low 13.",
    cloudPrecip: {
      textSummary:
        "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening.",
    },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "39" },
      pop: { units: "%", value: "30" },
      textSummary: "Chance of showers",
    },
    temperatures: {
      textSummary: "Low 13.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "13" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "19", end: "22", value: "rain" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "thursday",
    textSummary: "Mainly sunny. High 27. Humidex 30. UV index 9 or very high.",
    cloudPrecip: { textSummary: "Mainly sunny." },
    abbreviatedForecast: { iconCode: { format: "gif", value: "01" }, pop: { units: "%" }, textSummary: "Mainly sunny" },
    temperatures: {
      textSummary: "High 27.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "27" },
    },
    winds: null,
    humidex: { calculated: { unitType: "metric", value: "30" }, textSummary: "Humidex 30." },
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    uv: { category: "very high", index: "9", textSummary: "UV index 9 or very high." },
    relativeHumidity: { units: "%", value: "45" },
  },
  {
    day: "thursday night",
    textSummary: "Clear. Low 22.",
    cloudPrecip: { textSummary: "Clear." },
    abbreviatedForecast: { iconCode: { format: "gif", value: "30" }, pop: { units: "%" }, textSummary: "Clear" },
    temperatures: {
      textSummary: "Low 22.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "22" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "55" },
  },
  {
    day: "friday",
    textSummary: "A mix of sun and cloud with 40 percent chance of showers. High 30.",
    cloudPrecip: { textSummary: "A mix of sun and cloud with 40 percent chance of showers." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "06" },
      pop: { units: "%", value: "40" },
      textSummary: "Chance of showers",
    },
    temperatures: {
      textSummary: "High 30.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "30" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "58", end: "70", value: "rain" } },
    relativeHumidity: { units: "%", value: "50" },
  },
  {
    day: "friday night",
    textSummary: "Cloudy periods with 40 percent chance of showers. Low 15.",
    cloudPrecip: { textSummary: "Cloudy periods with 40 percent chance of showers." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "36" },
      pop: { units: "%", value: "40" },
      textSummary: "Chance of showers",
    },
    temperatures: {
      textSummary: "Low 15.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "15" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "70", end: "81", value: "rain" } },
    relativeHumidity: { units: "%", value: "65" },
  },
  {
    day: "saturday",
    textSummary: "Clearing. High 25.",
    cloudPrecip: { textSummary: "Clearing." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 25.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "25" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "40" },
  },
  {
    day: "saturday night",
    textSummary: "Cloudy periods. Low 13.",
    cloudPrecip: { textSummary: "Cloudy periods." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "32" },
      pop: { units: "%" },
      textSummary: "Cloudy periods",
    },
    temperatures: {
      textSummary: "Low 13.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "13" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "sunday",
    textSummary: "A mix of sun and cloud. High 24.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 24.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "24" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "45" },
  },
  {
    day: "sunday night",
    textSummary: "Cloudy periods. Low 15.",
    cloudPrecip: { textSummary: "Cloudy periods." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "32" },
      pop: { units: "%" },
      textSummary: "Cloudy periods",
    },
    temperatures: {
      textSummary: "Low 15.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "15" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "65" },
  },
  {
    day: "monday",
    textSummary: "A mix of sun and cloud. High 25.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 25.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "25" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "55" },
  },
  {
    day: "monday night",
    textSummary: "Cloudy periods. Low 16.",
    cloudPrecip: { textSummary: "Cloudy periods." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "32" },
      pop: { units: "%" },
      textSummary: "Cloudy periods",
    },
    temperatures: {
      textSummary: "Low 16.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "16" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "70" },
  },
  {
    day: "tuesday",
    textSummary: "A mix of sun and cloud. High 23.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 23.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "23" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "tuesday night",
    textSummary: "A mix of sun and cloud. High 23.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "Low 23.",
      temperature: { unitType: "metric", units: "C", class: "Low", value: "23" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "wednesday",
    textSummary: "A mix of sun and cloud. High 23.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 23.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "23" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "wednesday night",
    textSummary:
      "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening. Low 13.",
    cloudPrecip: {
      textSummary:
        "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening.",
    },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "39" },
      pop: { units: "%", value: "30" },
      textSummary: "Chance of showers",
    },
    temperatures: {
      textSummary: "Low 13.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "13" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "19", end: "22", value: "rain" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "thursday",
    textSummary: "A mix of sun and cloud. High 23.",
    cloudPrecip: { textSummary: "A mix of sun and cloud." },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "02" },
      pop: { units: "%" },
      textSummary: "A mix of sun and cloud",
    },
    temperatures: {
      textSummary: "High 23.",
      temperature: { unitType: "metric", units: "C", class: "high", value: "23" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "", end: "" } },
    relativeHumidity: { units: "%", value: "60" },
  },
  {
    day: "thursday night",
    textSummary:
      "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening. Low 13.",
    cloudPrecip: {
      textSummary:
        "Partly cloudy. 30 percent chance of showers early this evening with risk of a thunderstorm. Clearing late this evening.",
    },
    abbreviatedForecast: {
      iconCode: { format: "gif", value: "39" },
      pop: { units: "%", value: "30" },
      textSummary: "Chance of showers",
    },
    temperatures: {
      textSummary: "Low 13.",
      temperature: { unitType: "metric", units: "C", class: "low", value: "13" },
    },
    winds: null,
    humidex: null,
    precipitation: { textSummary: null, precipType: { start: "19", end: "22", value: "rain" } },
    relativeHumidity: { units: "%", value: "60" },
  },
];
