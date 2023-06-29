export default {
  name: "temperature-mixin",
  methods: {
    roundTemperatureToInt(temp, placeholder) {
      placeholder = placeholder || "N/A";
      if (isNaN(temp) || temp === null) return placeholder;

      const floatTemp = parseFloat(temp);
      return Math.round(floatTemp);
    },
  },
};
