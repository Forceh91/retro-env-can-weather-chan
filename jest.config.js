/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest/presets/js-with-ts-esm",

  testEnvironment: "node",
  moduleDirectories: ["node_modules", "src"],
  modulePathIgnorePatterns: ["testdata"],
  // from https://stackoverflow.com/a/57916712/15076557
  transformIgnorePatterns: [
    "node_modules/(?!(sarra-canada-amqp)/)",
    "node_modules/(?!(ec-weather-js)/)",
    "node_modules/(?!(xml-js)/)",
  ],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { useESM: true }],
    "^.+\\.ts?$": ["ts-jest", { useESM: true }],
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/**/routeHandler.ts",
    "!src/lib/logger.ts",
    "!src/server.ts",
    "!src/routes/**",
    "!src/consts/**",
    "!src/types/**",
  ],
  watchPathIgnorePatterns: ["db/*", "cfg/*"],
};
