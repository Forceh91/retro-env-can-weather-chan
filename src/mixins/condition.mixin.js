export default {
  name: "condition.mixin",
  methods: {
    truncateConditions(condition) {
      if (!condition) return "";

      if (condition.includes("with")) condition = condition.split(" with")[0];
      if (condition.includes("and")) condition = condition.split(" and")[0];
      return `${condition.slice(0, 16)}`;
    },
  },
};
