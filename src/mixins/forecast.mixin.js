export default {
  name: "forecast.mixin",
  methods: {
    truncateForecastText(text, addPlusSign) {
      if (!text) return "";

      // this will abbreviate certain words/phrases in the forecast to behave more like the original
      // first step is easy to make KM/H say KMH
      text = text.replace(/KM\/H/gi, "kmh");

      // turn ZERO into just the number 0
      text = text.replace(/zero/gi, 0);

      // now we want to find PLUS 1-5 and change that into +number
      if (addPlusSign) text = text.replace(/plus ([1-5])/gi, "+$1");

      // now we want to find PLUS number and change that into just number
      text = text.replace(/plus (\d+)/gi, "$1");

      // now we want to find MINUS number and change that into just -number
      text = text.replace(/minus (\d+)/gi, "-$1");

      // now we want to find number PERCENT and change that into just number%
      text = text.replace(/(\d+) percent/gi, "$1%");

      // thats everything for now
      return text;
    },
  },
};
