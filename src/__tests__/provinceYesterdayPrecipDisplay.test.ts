import { formatProvinceYesterdayPrecipDisplay } from "lib/display/provinceYesterdayPrecipDisplay";

describe("formatProvinceYesterdayPrecipDisplay", () => {
  it("shows NIL (padded) for numeric zero and sub-threshold liquid", () => {
    expect(formatProvinceYesterdayPrecipDisplay(0, "mm")).toBe("  NIL");
    expect(formatProvinceYesterdayPrecipDisplay(0.15, "mm")).toBe("  NIL");
  });

  it("shows NIL for string NIL only (no detectable precip token)", () => {
    expect(formatProvinceYesterdayPrecipDisplay("NIL", "mm")).toBe("  NIL");
    expect(formatProvinceYesterdayPrecipDisplay("nil", "mm")).toBe("  NIL");
  });

  it("shows MISSING for N/A (not available, not the same as NIL)", () => {
    expect(formatProvinceYesterdayPrecipDisplay("N/A", "mm")).toBe("MISSING");
    expect(formatProvinceYesterdayPrecipDisplay("n/a", "mm")).toBe("MISSING");
  });

  it("shows TRACE only for explicit trace string", () => {
    expect(formatProvinceYesterdayPrecipDisplay("Trace", "mm")).toBe("TRACE");
    expect(formatProvinceYesterdayPrecipDisplay("TRACE", "mm")).toBe("TRACE");
  });

  it("shows MISSING for null, NaN, and missing sentinels", () => {
    expect(formatProvinceYesterdayPrecipDisplay(null, "mm")).toBe("MISSING");
    expect(formatProvinceYesterdayPrecipDisplay(Number.NaN, "mm")).toBe("MISSING");
    expect(formatProvinceYesterdayPrecipDisplay("MISSING", "mm")).toBe("MISSING");
    expect(formatProvinceYesterdayPrecipDisplay("M", "mm")).toBe("MISSING");
    expect(formatProvinceYesterdayPrecipDisplay("", "mm")).toBe("MISSING");
  });

  it("formats measurable rain and snow", () => {
    expect(formatProvinceYesterdayPrecipDisplay(2.4, "mm")).toBe("  2.4 MM");
    expect(formatProvinceYesterdayPrecipDisplay(1.2, "cm snow")).toBe("1.2 CM SNOW");
  });

  it("uses a lower NIL threshold for snow units", () => {
    expect(formatProvinceYesterdayPrecipDisplay(0.03, "cm snow")).toBe("  NIL");
    expect(formatProvinceYesterdayPrecipDisplay(0.1, "cm snow")).toBe("0.1 CM SNOW");
  });
});
