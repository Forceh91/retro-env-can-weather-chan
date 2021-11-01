import { fetchWeatherForObservedCities, latestObservations } from "../observations";

test("fetchWeatherForObservedCities: does something", (done) => {
  fetchWeatherForObservedCities();
  done();
});

test("latestObservations: returns a blank result", (done) => {
  expect(latestObservations).toStrictEqual([]);
  done();
});
