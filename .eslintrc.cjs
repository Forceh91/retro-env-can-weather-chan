/* eslint-env node */
module.exports = {
  extends: ["plugin:@typescript-eslint/recommended-type-checked"],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    tsconfigRootDir: __dirname,
  },
  root: true,
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
    },
  ],
  ignorePatterns: ["*.js", "v1/*", "db/*", "dist/*", "cfg/*", "images/*", "node_modules/*", "*.cjs"],
  rules: {
    "@typescript-eslint/no-explicit-any": 0, // logger can have anything passed in so we don't care
    "@typescript-eslint/no-var-requires": 0, // sara-canada-amqp/ec-weather-js is used so need to disable this too
  },
};
