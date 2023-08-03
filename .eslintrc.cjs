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
  ignorePatterns: ["v1/*", "db/*", "dist/*", "cfg/*", "images/*", "node_modules/*"],
};
