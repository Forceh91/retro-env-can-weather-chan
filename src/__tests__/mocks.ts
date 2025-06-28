export const mockGetWeatherFileFromECCC = () => {
  jest.mock("lib/eccc/datamart", () => ({
    GetWeatherFileFromECCC: jest.fn(async () => Promise.resolve("https://dd.weather.gc.ca/citypage_weather/AA/00/")),
  }));
};
