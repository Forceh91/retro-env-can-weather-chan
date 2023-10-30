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

    // rain amounts
    expect(abbreviateForecast("amount 5 - 10 mm", forecastLengthWanted)).toStrictEqual("amount 5-10mm");
    expect(abbreviateForecast("local amount 5 - 10 mm", forecastLengthWanted)).toStrictEqual("local amount 5-10mm");
    expect(abbreviateForecast("amount 15 - 30 mm", forecastLengthWanted)).toStrictEqual("amount 15-30mm");
    // snow amounts
    expect(abbreviateForecast("amount 5 - 10 cm", forecastLengthWanted)).toStrictEqual("amount 5-10cm");
    expect(abbreviateForecast("local amount 5 - 10 cm", forecastLengthWanted)).toStrictEqual("local amount 5-10cm");
    expect(abbreviateForecast("amount 15 - 30 cm", forecastLengthWanted)).toStrictEqual("amount 15-30cm");
    // rain amounts #2
    expect(abbreviateForecast("amount 5 to 10 mm", forecastLengthWanted)).toStrictEqual("amount 5-10mm");
    expect(abbreviateForecast("local amount 5 to 10 mm", forecastLengthWanted)).toStrictEqual("local amount 5-10mm");
    expect(abbreviateForecast("amount 15 to 30 mm", forecastLengthWanted)).toStrictEqual("amount 15-30mm");
    // snow amounts #2
    expect(abbreviateForecast("amount 5 to 10 cm", forecastLengthWanted)).toStrictEqual("amount 5-10cm");
    expect(abbreviateForecast("local amount 5 to 10 cm", forecastLengthWanted)).toStrictEqual("local amount 5-10cm");
    expect(abbreviateForecast("amount 15 to 30 cm", forecastLengthWanted)).toStrictEqual("amount 15-30cm");

    expect(abbreviateForecast("midnight", forecastLengthWanted)).toStrictEqual("12am");
    expect(abbreviateForecast("temperature steady", forecastLengthWanted)).toStrictEqual("temp steady");
    expect(
      abbreviateForecast("30 percent chance of showers changing to 70 percent chance of showers", forecastLengthWanted)
    ).toStrictEqual("30-70% chnc of shwrs");
    expect(
      abbreviateForecast(
        "30 percent chance of showers changing to 70 percent chance of showers. clearing after noon. high 12.",
        forecastLengthWanted
      )
    ).toStrictEqual("30-70% chnc of shwrs. clearing after noon. high 12.");
    expect(
      abbreviateForecast(
        "30 percent chance of showers changing to 70 percent chance of showers near noon",
        forecastLengthWanted
      )
    ).toStrictEqual("30-70% chnc of shwrs until noon");
    expect(
      abbreviateForecast(
        "30 percent chance of showers changing to 70 percent chance of showers near midnight",
        forecastLengthWanted
      )
    ).toStrictEqual("30-70% chnc of shwrs until 12am");
    expect(
      abbreviateForecast(
        "30 percent chance of showers changing to 70 percent chance of showers changing to 30 percent chance of showers near noon",
        forecastLengthWanted
      )
    ).toStrictEqual("30-70% chnc of shwrs until noon");
    expect(
      abbreviateForecast(
        "30 percent chance of showers changing to 70 percent chance of showers changing to 30 percent chance of showers near noon. clearing in the aftn. high 12.",
        forecastLengthWanted
      )
    ).toStrictEqual("30-70% chnc of shwrs until noon. clearing in the aftn. high 12.");
    expect(abbreviateForecast("cloudy with 60 percent chance of showers. low 13.", forecastLengthWanted)).toStrictEqual(
      "cloudy w/ 60% chnc of shwrs. low 13."
    );
    expect(abbreviateForecast("fog patches developing overnight", forecastLengthWanted)).toStrictEqual(
      "fog patches overnight"
    );
    expect(abbreviateForecast("fog patches developing after 12am", forecastLengthWanted)).toStrictEqual(
      "fog patches after 12am"
    );
    expect(abbreviateForecast("partly cloudy", forecastLengthWanted)).toStrictEqual("ptly cldy");
    expect(abbreviateForecast("mix of sun and cloud", forecastLengthWanted)).toStrictEqual("mix sun/cld");
    expect(abbreviateForecast("a mix of sun and cloud", forecastLengthWanted)).toStrictEqual("mix sun/cld");
  });
});
