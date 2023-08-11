jest.mock("consts/sunspots.consts", () => ({
  ...jest.requireActual("consts/sunspots.consts"),
  SUNSPOT_CITIES: [
    { name: "Honolulu", code: "HFO", x: 150, y: 145 },
    { name: "Phoenix", code: "PSR", x: 160, y: 56 },
  ],
}));

jest.mock("lib/date/season", () => ({ isSunSpotSeason: jest.fn(() => true) }));

import moxios from "moxios";
import axios from "lib/backendAxios";
import { initializeSunspots } from "lib/sunspots";
import HFOResponse from "./testdata/sunspots/HFO.json";
import PSRResponse from "./testdata/sunspots/PSR.json";
import expectedResponse from "./testdata/sunspots/expected.json";

describe("Sunspot weather forecasts", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("fetches and parses the station data correctly", (done) => {
    const sunspots = initializeSunspots();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: HFOResponse });
      await moxios.requests.at(1).respondWith({ status: 200, response: PSRResponse });

      expect(sunspots.sunspots()).toStrictEqual(expectedResponse);
      done();
    });
  });

  it("filters out stations that aren't reporting forecast correctly", (done) => {
    const sunspots = initializeSunspots();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({
        status: 200,
        response: {
          ...HFOResponse,
          properties: {
            ...HFOResponse.properties,
            periods: [
              { ...HFOResponse.properties.periods[0], shortForecast: "unknown" },
              ...HFOResponse.properties.periods.slice(1),
            ],
          },
        },
      });
      await moxios.requests.at(1).respondWith({ status: 200, response: PSRResponse });

      expect(sunspots.sunspots()).toStrictEqual([expectedResponse[1]]);
      done();
    });
  });

  it("filters out stations that aren't reporting temperature correctly", (done) => {
    const sunspots = initializeSunspots();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({
        status: 200,
        response: {
          ...HFOResponse,
          properties: {
            ...HFOResponse.properties,
            periods: [
              { ...HFOResponse.properties.periods[0], temperature: null },
              ...HFOResponse.properties.periods.slice(1),
            ],
          },
        },
      });
      await moxios.requests.at(1).respondWith({ status: 200, response: PSRResponse });

      expect(sunspots.sunspots()).toStrictEqual([expectedResponse[1]]);
      done();
    });
  });
});
