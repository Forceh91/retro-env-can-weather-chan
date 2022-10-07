export default {
  name: "condition.mixin",
  methods: {
    truncateConditions(condition) {
      if (!condition) return "";

      if (condition.includes("with")) condition = condition.split(" with")[0];
      if (condition.includes("and")) condition = condition.split(" and")[0];
      return `${condition.slice(0, 16)}`;
    },

    harshTruncateConditions(condition) {
      // to lowercase
      condition = condition.toLowerCase();

      // handle thunderstorm when its prefaced with light/heavy
      if (condition.includes("light thunderstorm") || condition.includes("heavy thunderstorm"))
        condition = condition.replace(/thunderstorm/gi, "tstorm");

      // handle light/heavy conditions
      if (condition.length > 13) condition = condition.replace(/light/gi, "lght").replace(/heavy/gi, "hvy");

      // handle light/heavy rainshower
      condition = condition.replace(/\srainshower/gi, " rainshwr");

      // handle light/heacy snowshower
      condition = condition.replace(/\ssnowshower/gi, " snowshwr");

      // final truncation for and/width
      condition = this.truncateConditions(condition);

      // now truncate to just 13 chars
      return `${condition.slice(0, 13)}`;
    },
  },
};
