import {
  alertIdentifiers,
  forecastSignature,
  hasNewAlert,
  msUntilNextRefresh,
  normaliseRefreshMode,
} from "lib/refresh";

describe("refresh helpers", () => {
  it("falls back to the original behaviour for unknown modes", () => {
    expect(normaliseRefreshMode(undefined)).toBe("observation");
    expect(normaliseRefreshMode("nonsense")).toBe("observation");
    expect(normaliseRefreshMode("ten-minute")).toBe("ten-minute");
  });

  it("works out the time to the next ten minute mark", () => {
    expect(msUntilNextRefresh(new Date(2026, 0, 1, 10, 3, 30, 0))).toBe(6.5 * 60 * 1000);
    expect(msUntilNextRefresh(new Date(2026, 0, 1, 10, 10, 0, 0))).toBe(10 * 60 * 1000);
    expect(msUntilNextRefresh(new Date(2026, 0, 1, 10, 59, 59, 500))).toBe(500);
  });

  it("only treats alerts we haven't seen as new", () => {
    const a = { identifier: "a" };
    const b = { identifier: "b" };
    expect(hasNewAlert([], [a])).toBe(true);
    expect(hasNewAlert([a], [a, b])).toBe(true);
    expect(hasNewAlert([a, b], [a])).toBe(false);
    expect(hasNewAlert(undefined, [])).toBe(false);
    expect(alertIdentifiers([a, b])).toEqual(["a", "b"]);
  });

  it("changes the forecast signature only when the displayed text changes", () => {
    const f = (text: string) => [
      {
        period: "Today",
        abbreviatedTextSummary: text,
        textSummary: "",
        temperature: { value: 1, class: "high" },
        conditions: "",
      },
    ];
    expect(forecastSignature(f("sunny"))).toBe(forecastSignature(f("sunny")));
    expect(forecastSignature(f("sunny"))).not.toBe(forecastSignature(f("cloudy")));
    expect(forecastSignature(undefined)).toBe("");
  });
});
