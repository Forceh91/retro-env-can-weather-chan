import { formatProvinceYesterdayPrecipDisplay } from "lib/display/provinceYesterdayPrecipDisplay";

describe("formatProvinceYesterdayPrecipDisplay", () => {
  it("shows TRACE for numeric zero (not NIL)", () => {
    expect(formatProvinceYesterdayPrecipDisplay(0, "mm")).toBe("TRACE");
  });

  it("shows TRACE for string nil / n/a from citypage or bad persistence", () => {
    expect(formatProvinceYesterdayPrecipDisplay("NIL", "mm")).toBe("TRACE");
    expect(formatProvinceYesterdayPrecipDisplay("nil", "mm")).toBe("TRACE");
    expect(formatProvinceYesterdayPrecipDisplay("N/A", "mm")).toBe("TRACE");
  });

  it("shows NIL only for null / NaN", () => {
    expect(formatProvinceYesterdayPrecipDisplay(null, "mm")).toBe("  NIL");
    expect(formatProvinceYesterdayPrecipDisplay(Number.NaN, "mm")).toBe("  NIL");
  });

  it("formats measurable rain and snow", () => {
    // Two-letter units (e.g. "mm") keep the legacy two-space prefix used on the province plate.
    expect(formatProvinceYesterdayPrecipDisplay(2.4, "mm")).toBe("  2.4 MM");
    expect(formatProvinceYesterdayPrecipDisplay(1.2, "cm snow")).toBe("1.2 CM SNOW");
  });

  it("uses a lower trace threshold for snow units", () => {
    expect(formatProvinceYesterdayPrecipDisplay(0.03, "cm snow")).toBe("TRACE");
    expect(formatProvinceYesterdayPrecipDisplay(0.1, "cm snow")).toBe("0.1 CM SNOW");
  });
});
