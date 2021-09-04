const windchill = require("../src/js/windChill");

test("calculates windchill correctly", (done) => {
  expect(windchill.calculateWindChillNumber(0, 0)).toBe(400);
  expect(windchill.calculateWindChillNumber(-5, 5)).toBe(920);
  expect(windchill.calculateWindChillNumber(-10, 10)).toBe(1216);
  expect(windchill.calculateWindChillNumber(-15, 20)).toBe(1587);

  done();
});
