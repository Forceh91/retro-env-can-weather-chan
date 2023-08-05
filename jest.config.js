/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",

  testEnvironment: "node",
  testPathIgnorePatterns: ["v1/*"],
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: ["testdata"],
  // from https://stackoverflow.com/a/57916712/15076557
  transformIgnorePatterns: ["node_modules/(?!(sarra-canada-amqp)/)", "node_modules/(?!(ec-weather-js)/)"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.ts?$": ["ts-jest", { useESM: true }],
  },
};
