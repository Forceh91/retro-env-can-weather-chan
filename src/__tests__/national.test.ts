jest.mock("consts/national.consts", () => ({
  ...jest.requireActual("consts/national.consts"),
  MB_WEATHER_STATIONS: [
    { name: "Portage", code: "MB/s0000626" },
    { name: "Norway House", code: "MB/s0000616" },
  ],
  WEST_WEATHER_STATIONS: [{ name: "Vancouver", code: "BC/s0000141" }],
  EAST_WEATHER_STATIONS: [{ name: "Toronto", code: "ON/s0000458" }],
}));

import axios from "lib/backendAxios";
import moxios from "moxios";
import { initializeNationalWeather } from "lib/national/national";
import fakeResponses from "./testdata/ecccData/national/fakeResponses";
import expectedConditions from "./testdata/ecccData/national/expectedConditions.json";

describe("National weather station temp/condition", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("fetches and parses the station data correctly", (done) => {
    const national = initializeNationalWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: fakeResponses["MB/s0000626"] });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeResponses["MB/s0000616"] });
      await moxios.requests.at(2).respondWith({ status: 200, response: fakeResponses["ON/s0000458"] });
      await moxios.requests.at(3).respondWith({ status: 200, response: fakeResponses["BC/s0000141"] });

      const currentConditions = national.nationalWeather();
      expect(currentConditions).toStrictEqual(expectedConditions);
      done();
    });
  });

  it("filters out stations that aren't reporting correctly", (done) => {
    const national = initializeNationalWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: fakeResponses["MB/s0000626"] }); // conditions are "unknown precipitation"
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeResponses["BC/s0000568"] }); // temperature isn't present
      await moxios.requests.at(2).respondWith({ status: 500 }); // api failure
      await moxios.requests.at(3).respondWith({ status: 404, response: "not found lol" }); // no file

      const currentConditions = national.nationalWeather();
      expect(currentConditions.mb).toStrictEqual(expectedConditions.mb);
      expect(currentConditions.east).toHaveLength(0);
      expect(currentConditions.west).toHaveLength(0);
      done();
    });
  });
});
