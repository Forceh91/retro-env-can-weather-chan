import { generateWindchill } from "../current-conditions";

describe("current conditions", () => {
  describe("windchill", () => {
    test("it isn't present if the temp is above 0", (done) => {
      let temperature = { value: 0.5 };
      let wind = { speed: { value: 15 } };

      expect(generateWindchill({ temperature, wind })).toBe(0);

      temperature = { value: 1 };
      wind = { speed: { value: 50 } };
      expect(generateWindchill({ temperature, wind })).toBe(0);
      done();
    });

    test("it isn't present if the wind speed is less than 10", (done) => {
      let temperature = { value: -5 };
      let wind = { speed: { value: 5 } };

      expect(generateWindchill({ temperature, wind })).toBe(0);
      done();
    });

    test("it isn't present if the windchill value is less than 1200", (done) => {
      let temperature = { value: -2 };
      let wind = { speed: { value: 15 } };

      expect(generateWindchill({ temperature, wind })).toBe(0);
      done();
    });

    test("it returns the correct values for windchill", (done) => {
      const temps = [-2, -5, -10, -15, -20, -25];
      const windspeeds = [15, 20, 25, 12, 30, 60];
      const windchills = [0, 1250, 1500, 1400, 1900, 2350];

      for (let i = 0; i < temps.length; i++) {
        const temp = temps[i];
        const wind = windspeeds[i];
        const expected = windchills[i];

        expect(generateWindchill({ temperature: { value: temp }, wind: { speed: { value: wind } } })).toBe(expected);
      }

      done();
    });
  });
});
