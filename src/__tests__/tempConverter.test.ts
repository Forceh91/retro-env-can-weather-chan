import { convertFToC } from "lib/usaweather/tempConverter";

describe("USA Temps", () => {
  it("converts F to C correctly", () => {
    expect(Math.round(convertFToC(32))).toBe(0);
    expect(Math.round(convertFToC(70))).toBe(21);
    expect(Math.round(convertFToC(90))).toBe(32);
    expect(Math.round(convertFToC(-4))).toBe(-20);
  });
});
