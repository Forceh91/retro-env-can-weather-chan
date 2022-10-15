export default {
  name: "string-pad-mixin",
  methods: {
    padString(val, minLength, isFront, char) {
      if (val === undefined || val === null) return "";
      val = `${val}`;

      char = char || `&nbsp;`;
      const paddingToAdd = minLength - val.length;
      let paddingString = ``;
      for (let i = 0; i < paddingToAdd; i++) paddingString += char;

      return !isFront ? `${val}${paddingString}` : `${paddingString}${val}`;
    },
  },
};
