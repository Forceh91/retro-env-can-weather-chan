import { abbreviateForecast } from "lib/conditions/forecast";

describe("forecast truncation", () => {
  test("abbreviateForecast", () => {
    const forecastLengthWanted = 5;

    expect(abbreviateForecast("", forecastLengthWanted)).toStrictEqual("");
    expect(abbreviateForecast("high plus 1", forecastLengthWanted)).toStrictEqual("high +1");
    expect(abbreviateForecast("high plus 3", forecastLengthWanted)).toStrictEqual("high +3");
    expect(abbreviateForecast("high plus 5", forecastLengthWanted)).toStrictEqual("high +5");
    expect(abbreviateForecast("high plus 12", forecastLengthWanted)).toStrictEqual("high +12");
    expect(abbreviateForecast("high zero", forecastLengthWanted)).toStrictEqual("high 0");
    expect(abbreviateForecast("low minus 6", forecastLengthWanted)).toStrictEqual("low -6");
    expect(abbreviateForecast("low minus 16", forecastLengthWanted)).toStrictEqual("low -16");
    expect(abbreviateForecast("low minus 24", forecastLengthWanted)).toStrictEqual("low -24");
    expect(abbreviateForecast("low zero", forecastLengthWanted)).toStrictEqual("low 0");
    expect(abbreviateForecast("wind northeast 20 km/h", forecastLengthWanted)).toStrictEqual("wind NE 20");
    expect(abbreviateForecast("40 percent chance of showers", forecastLengthWanted)).toStrictEqual("40% chnc of shwrs");
    expect(abbreviateForecast("100 percent chance of flurries", forecastLengthWanted)).toStrictEqual(
      "100% chnc of flurries"
    );
    expect(abbreviateForecast("5 percent chance of flurries", forecastLengthWanted)).toStrictEqual(
      "5% chnc of flurries"
    );
    expect(abbreviateForecast("wind southwest 20 km/h gusting to 40 km/h", forecastLengthWanted)).toStrictEqual(
      "wind SW 20g40"
    );
    expect(abbreviateForecast("amount 5 - 10 mm", forecastLengthWanted)).toStrictEqual("amount 5-10mm");
    expect(abbreviateForecast("local amount 5 - 10 mm", forecastLengthWanted)).toStrictEqual("local amount 5-10mm");
    expect(abbreviateForecast("amount 15 - 30 mm", forecastLengthWanted)).toStrictEqual("amount 15-30mm");
  });
});
