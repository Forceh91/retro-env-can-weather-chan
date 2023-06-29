import { isWindchillSeason, isSunSpotSeason } from "../date-utils";

test("isWindchillSeason: calculates if its windchill season correctly or not", (done) => {
  const windchillMonths = [11, 12, 1, 2, 3, 4];
  const notWindchillMonths = [5, 6, 7, 8, 9, 10];

  windchillMonths.forEach((month) => expect(isWindchillSeason(month)).toBe(true));
  notWindchillMonths.forEach((month) => expect(isWindchillSeason(month)).toBe(false));
  done();
});

test("isSunSpotSeason: calculates if its sunspot season correctly or not", (done) => {
  const sunspotMonths = [2, 3];
  const notSunspotMonths = [1, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  sunspotMonths.forEach((month) => expect(isSunSpotSeason(month)).toBe(true));
  notSunspotMonths.forEach((month) => expect(isSunSpotSeason(month)).toBe(false));
  done();
});
