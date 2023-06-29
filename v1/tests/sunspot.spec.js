import { addForecastForSunspot, convertFToC } from "../sunspot";
import phoenixforecast from "./data/phoenixforecast";
import phoenixforecastatnight from "./data/phoenixforecastatnight";

const phoenix = {
  name: "Phoenix",
  stationCode: "PSR",
  x: 160,
  y: 56,
  forecastText: null,
  hiTemp: Math.min(),
  loTemp: Math.max(),
};

describe("sunspot.js", () => {
  test("addForecastForSunspot: adds forecast data correctly", (done) => {
    const results = [phoenix];
    addForecastForSunspot(results, phoenix, phoenixforecast);
    const [forecast] = results;

    const { forecastText, hiTemp, loTemp } = forecast;
    expect(forecastText).toBe("Sunny");
    expect(hiTemp).toBe(18);
    expect(loTemp).toBe(6);
    done();
  });

  test("addForecastForSunspot: adds forecast data correctly when night is first", (done) => {
    const results = [phoenix];
    addForecastForSunspot(results, phoenix, phoenixforecastatnight);
    const [forecast] = results;

    const { forecastText, hiTemp, loTemp } = forecast;
    expect(forecastText).toBe("Sunny");
    expect(hiTemp).toBe(20);
    expect(loTemp).toBe(8);
    done();
  });

  test("addForecastForSunspot: adds forecast data correctly when theres an error", (done) => {
    const results = [phoenix];
    addForecastForSunspot(results, phoenix, {});
    const [forecast] = results;

    const { forecastText, hiTemp, loTemp } = forecast;
    expect(forecastText).toBe(null);
    expect(hiTemp).toBe(Math.min());
    expect(loTemp).toBe(Math.max());
    done();
  });

  test("convertFToC: converts temps correctly", (done) => {
    expect(convertFToC(32)).toBe(0);
    expect(convertFToC(70)).toBe(21);
    expect(convertFToC(90)).toBe(32);
    expect(convertFToC(-4)).toBe(-20);
    done();
  });
});
