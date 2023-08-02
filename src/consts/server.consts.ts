const cliArgumentPortIx = process.argv.indexOf("--port");

export const API_PORT = cliArgumentPortIx > -1 ? Number(process.argv[cliArgumentPortIx + 1]) : 8600;
export const CORS_OPTIONS = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
};

export const DEFAULT_WEATHER_STATION_ID = "s0000193";
