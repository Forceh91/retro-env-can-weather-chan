import { abbreviateForecast } from "lib/conditions/forecast";

describe("Forecast Truncation", () => {
  const forecastLengthWanted = 5;

  test("Time", () => {
    expect(abbreviateForecast("morning", forecastLengthWanted)).toStrictEqual("mrng");
    expect(abbreviateForecast("afternoon", forecastLengthWanted)).toStrictEqual("aftn");
    expect(abbreviateForecast("evening", forecastLengthWanted)).toStrictEqual("eve");
    expect(abbreviateForecast("midnight", forecastLengthWanted)).toStrictEqual("12am");
    expect(abbreviateForecast("beginning", forecastLengthWanted)).toStrictEqual("bgng");
    expect(abbreviateForecast("occasional", forecastLengthWanted)).toStrictEqual("ocnl");
    expect(abbreviateForecast("early this evening", forecastLengthWanted)).toStrictEqual("early eve");
    expect(abbreviateForecast("wind becoming 20kmh early in the morning", forecastLengthWanted)).toStrictEqual(
      "wind bcmg 20 early mrng"
    );
    expect(abbreviateForecast("wind becoming 30kmh early in the afternoon", forecastLengthWanted)).toStrictEqual(
      "wind bcmg 30 early aftn"
    );
    expect(abbreviateForecast("wind becoming 40kmh early in the evening", forecastLengthWanted)).toStrictEqual(
      "wind bcmg 40 early eve"
    );
    expect(abbreviateForecast("rain showers late in the morning", forecastLengthWanted)).toStrictEqual(
      "rain shwrs late mrng"
    );
    expect(abbreviateForecast("rain showers late in the afternoon", forecastLengthWanted)).toStrictEqual(
      "rain shwrs late aftn"
    );
    expect(abbreviateForecast("rain showers late in the evening", forecastLengthWanted)).toStrictEqual(
      "rain shwrs late eve"
    );
  });

  test("Temperatures", () => {
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
    expect(abbreviateForecast("temperature steady", forecastLengthWanted)).toStrictEqual("temp steady");
  });

  test("Wind Speeds", () => {
    expect(abbreviateForecast("wind northeast 20 km/h", forecastLengthWanted)).toStrictEqual("wind NE 20");
    expect(abbreviateForecast("wind southwest 20 km/h gusting to 40 km/h", forecastLengthWanted)).toStrictEqual(
      "wind SW 20g40"
    );
  });

  test("Wind speed increasing/decreasing", () => {
    expect(abbreviateForecast("wind north 20 kmh increasing to 50 gusting to 70", forecastLengthWanted)).toStrictEqual(
      "wind N 20 incr to 50g70"
    );
    expect(abbreviateForecast("then diminishing to 30 gusting to 50", forecastLengthWanted)).toStrictEqual(
      "then dmnshg to 30g50"
    );
  });

  test("Rain/Snow Amounts", () => {
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
  });

  test("Chance of precipitation", () => {
    expect(abbreviateForecast("40 percent chance of showers", forecastLengthWanted)).toStrictEqual("40% chnc of shwrs");
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
  });

  test("Condition developing", () => {
    expect(abbreviateForecast("fog patches developing overnight", forecastLengthWanted)).toStrictEqual(
      "fog patches ovrngt"
    );
    expect(abbreviateForecast("fog patches developing after 12am", forecastLengthWanted)).toStrictEqual(
      "fog patches after 12am"
    );
  });

  test("Misc conditions", () => {
    expect(abbreviateForecast("partly cloudy", forecastLengthWanted)).toStrictEqual("ptly cldy");
    expect(abbreviateForecast("mix of sun and cloud", forecastLengthWanted)).toStrictEqual("mix sun/cld");
    expect(abbreviateForecast("a mix of sun and cloud", forecastLengthWanted)).toStrictEqual("mix sun/cld");
    expect(abbreviateForecast("30% chance of showers or tstorms", forecastLengthWanted)).toStrictEqual(
      "30% chnc of shwrs/tstorms"
    );
    expect(abbreviateForecast("rain or flurries overnight", forecastLengthWanted)).toStrictEqual("rain/flrys ovrngt");
  });

  test("Wintery weather", () => {
    expect(abbreviateForecast("blowing snow in outlying areas", forecastLengthWanted)).toStrictEqual("blwg snow");
    expect(abbreviateForecast("100 percent chance of flurries", forecastLengthWanted)).toStrictEqual(
      "100% chnc of flrys"
    );
    expect(abbreviateForecast("5 percent chance of flurries", forecastLengthWanted)).toStrictEqual("5% chnc of flrys");
  });

  test("Compass directions", () => {
    expect(abbreviateForecast("wind north", forecastLengthWanted)).toStrictEqual("wind N");
    expect(abbreviateForecast("wind east", forecastLengthWanted)).toStrictEqual("wind E");
    expect(abbreviateForecast("wind south", forecastLengthWanted)).toStrictEqual("wind S");
    expect(abbreviateForecast("wind west", forecastLengthWanted)).toStrictEqual("wind W");
  });

  test("Misc", () => {
    expect(abbreviateForecast("local blowing snow in outlying areas this evening", forecastLengthWanted)).toStrictEqual(
      "local blwg snow this eve"
    );
  });

  test("Real forecasts with issues", () => {
    expect(
      abbreviateForecast(
        "Partly cloudy. 30 percent chance of rain showers or flurries changing to 30 percent chance of flurries near midnight. Wind west 20 km/h becoming light early this evening. Low minus 2. Wind chill minus 4 overnight.",
        forecastLengthWanted
      )
    ).toStrictEqual(
      "ptly cldy. 30% chnc of rain shwrs/flrys until 12am. wind W 20 bcmg light early eve. low -2. wind chill -4 ovrngt."
    );
    expect(
      abbreviateForecast(
        "Partly cloudy. 30 percent chance of rain showers or flurries changing to 70 percent chance of flurries near midnight. Wind west 20 km/h becoming light early this evening. Low minus 2. Wind chill minus 4 overnight.",
        forecastLengthWanted
      )
    ).toStrictEqual(
      "ptly cldy. 30-70% chnc of rain shwrs/flrys until 12am. wind W 20 bcmg light early eve. low -2. wind chill -4 ovrngt."
    );
    expect(
      abbreviateForecast(
        "Partly cloudy. 70 percent chance of rain showers or flurries changing to 30 percent chance of flurries near midnight. Wind west 20 km/h becoming light early this evening. Low minus 2. Wind chill minus 4 overnight.",
        forecastLengthWanted
      )
    ).toStrictEqual(
      "ptly cldy. 30-70% chnc of rain shwrs/flrys until 12am. wind W 20 bcmg light early eve. low -2. wind chill -4 ovrngt."
    );
    expect(
      abbreviateForecast(
        "A mix of sun and cloud. 30 percent chance of flurries in the afternoon. Wind becoming west 20 km/h in the afternoon. High minus 1. Wind chill minus 14 in the morning and minus 5 in the afternoon. UV index 3 or moderate.",
        forecastLengthWanted
      )
    ).toStrictEqual(
      "mix sun/cld. 30% chnc of flrys in the aftn. wind bcmg W 20 in the aftn. high -1. wind chill -14 in the mrng and -5 in the aftn. uv index 3 or moderate."
    );
  });
});
