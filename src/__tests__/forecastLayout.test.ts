import { allocateForecastContinuationLines } from "lib/display";

const words = (n: number) => Array.from({ length: n }, (_, i) => `word${i}`).join(" ");

describe("forecast continuation layout", () => {
  it("keeps the blank separator when both forecasts are short", () => {
    expect(allocateForecastContinuationLines("Today..sunny", "Tonight..clear")).toEqual({
      upperLines: 1,
      lowerLines: 1,
      separator: true,
    });
  });

  it("lets the upper forecast use a fourth line, taking the separator", () => {
    const upper = `Thursday..${words(18)}`; // 4 lines
    const result = allocateForecastContinuationLines(upper, `Thursday night..${words(10)}`);
    expect(result.upperLines).toBe(4);
    expect(result.lowerLines).toBe(3);
    expect(result.separator).toBe(false);
  });

  it("holds the lower forecast to 3 lines when the upper needs 4", () => {
    const long = `Thursday..${words(18)}`;
    const result = allocateForecastContinuationLines(long, long);
    expect(result.upperLines).toBe(4);
    expect(result.lowerLines).toBe(3);
  });

  it("shares the space dynamically when the upper forecast is short", () => {
    const result = allocateForecastContinuationLines("Thursday..cloudy", `Thursday night..${words(18)}`);
    expect(result.upperLines).toBe(1);
    expect(result.lowerLines).toBe(4);
  });
});
