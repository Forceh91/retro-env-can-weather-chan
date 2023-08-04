import { calculateWindchill } from "lib/conditions";

describe("windchill", () => {
  it("it isn't present if the temp is above 0", () => {
    expect(calculateWindchill(0.5, 15)).toBe(null);
    expect(calculateWindchill(1, 50)).toBe(null);
  });

  it("it isn't present if the wind speed is less than 10", () => {
    expect(calculateWindchill(-5, 5)).toBe(null);
  });

  it("it isn't present if the windchill value is less than 1200", () => {
    expect(calculateWindchill(-2, -15)).toBe(null);
  });

  it("it returns the correct values for windchill", () => {
    const temps = [-2, -5, -10, -15, -20, -25];
    const windspeeds = [15, 20, 25, 12, 30, 60];
    const windchills = [null, 1250, 1500, 1400, 1900, 2350];

    for (let i = 0; i < temps.length; i++) {
      const temp = temps[i];
      const wind = windspeeds[i];
      const expected = windchills[i];

      expect(calculateWindchill(temp, wind)).toBe(expected);
    }
  });
});
