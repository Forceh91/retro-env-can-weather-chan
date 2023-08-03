import { harshTruncateConditions } from "lib/conditions";

describe("condition truncation", () => {
  test("harshTruncateConditions: makes sure condition string is only 13 characters", (done) => {
    const conditionA = harshTruncateConditions("sunny");
    expect(conditionA).toBe("sunny");

    const conditionB = harshTruncateConditions("mostly cloudy");
    expect(conditionB).toBe("mostly cloudy");

    const conditionC = harshTruncateConditions("thunderstorm with light rainshower");
    expect(conditionC).toBe("thunderstorm");

    done();
  });

  test("harshTruncateConditions: handles light/heavy and rain/snowshower better", (done) => {
    const conditionA = harshTruncateConditions("sunny");
    expect(conditionA).toBe("sunny");

    const conditionB = harshTruncateConditions("light rainshower");
    expect(conditionB).toBe("lgt rainshwr");

    expect(harshTruncateConditions("")).toBe("");
    expect(harshTruncateConditions("heavy thunderstorm")).toBe("heavy tstorm");
    expect(harshTruncateConditions("heavy rainshower")).toBe("hvy rainshwr");
    expect(harshTruncateConditions("mostly cloudy")).toBe("mostly cloudy");
    expect(harshTruncateConditions("partly cloudy")).toBe("partly cloudy");
    expect(harshTruncateConditions("mostly clear")).toBe("mostly clear");
    expect(harshTruncateConditions("light rain")).toBe("light rain");
    expect(harshTruncateConditions("rainshower")).toBe("rainshower");
    expect(harshTruncateConditions("light rainshower")).toBe("lgt rainshwr");
    expect(harshTruncateConditions("heavy rainshower")).toBe("hvy rainshwr");
    expect(harshTruncateConditions("light snowshower")).toBe("lgt snowshwr");
    expect(harshTruncateConditions("heavy snowshower")).toBe("hvy snowshwr");

    done();
  });

  test("harshTruncateConditions: handles light/heavy rain and snow", (done) => {
    expect(harshTruncateConditions("light rain and snow")).toBe("rain/snow");
    expect(harshTruncateConditions("heavy rain and snow")).toBe("rain/snow");
    expect(harshTruncateConditions("light snow and rain")).toBe("rain/snow");
    expect(harshTruncateConditions("heavy snow and rain")).toBe("rain/snow");
    done();
  });

  test("harshTruncateConditions: handles light/heavy freezing rain", (done) => {
    expect(harshTruncateConditions("light freezing rain")).toBe("lgt frzg rain");
    expect(harshTruncateConditions("heavy freezing rain")).toBe("hvy frzg rain");
    done();
  });

  test("harshTruncateConditions: handles light/heavy snow + blowing snow", (done) => {
    expect(harshTruncateConditions("light snow and blowing snow")).toBe("snow/blw snow");
    expect(harshTruncateConditions("heavy snow and blowing snow")).toBe("snow/blw snow");
    expect(harshTruncateConditions("light snow shower and blowing snow")).toBe("snow/blw snow");
    expect(harshTruncateConditions("heavy snow shower and blowing snow")).toBe("snow/blw snow");
    done();
  });

  test("harshTruncateConditions: handles light/heavy freezing drizzle", (done) => {
    expect(harshTruncateConditions("light freezing drizzle")).toBe("lgt frzg drzl");
    expect(harshTruncateConditions("heavy freezing drizzle")).toBe("hvy frzg drzl");
    done();
  });

  test("harshTruncateConditions: handles light/heavy rain + drizzle", (done) => {
    expect(harshTruncateConditions("light rain and drizzle")).toBe("lgt rain/drzl");
    expect(harshTruncateConditions("heavy rain and drizzle")).toBe("hvy rain/drzl");
    done();
  });

  test("harshTruncateConditions: handles light/heavy drizzle fog/mist", (done) => {
    expect(harshTruncateConditions("light drizzle fog/mist")).toBe("light drizzle");
    expect(harshTruncateConditions("heavy drizzle fog/mist")).toBe("heavy drizzle");
    done();
  });

  test("harshTruncateConditionss: gets rid of fog/mist if theres a space before it", (done) => {
    expect(harshTruncateConditions("Light Snow Fog/Mist")).toBe("light snow");
    expect(harshTruncateConditions("Light Snow and Fog/Mist")).toBe("light snow");
    expect(harshTruncateConditions("Rain Fog/Mist")).toBe("rain");
    expect(harshTruncateConditions("Rain and Fog/Mist")).toBe("rain");
    expect(harshTruncateConditions("Drizzle Fog/Mist")).toBe("drizzle");
    expect(harshTruncateConditions("Drizzle and Fog/Mist")).toBe("drizzle");
    done();
  });

  test("harshTruncateConditionss: handles [condition] and drizzle", (done) => {
    expect(harshTruncateConditions("Light Drizzle and Fog")).toBe("light drizzle");
    done();
  });

  test("harshTruncateConditionss: handles freezing fog correctly", (done) => {
    expect(harshTruncateConditions("Freezing Fog")).toBe("freezing fog");
    done();
  });
});
