jest.mock("consts/national.consts", () => ({
  ...jest.requireActual("consts/usa.consts"),
  USA_WEATHER_STATIONS: [
    { name: "Grand Forks", code: "KGFK" },
    { name: "Fargo", code: "KFAR" },
  ],
}));

import moxios from "moxios";
import axios from "lib/backendAxios";
import { initializeUSAWeather } from "lib/usaweather/usaweather";
import KGFKResponse from "./testdata/usaweather/KGFK.json";
import KFARResponse from "./testdata/usaweather/KFAR.json";
import expectedResponse from "./testdata/usaweather/expected.json";

describe("USA weather station temp/condition", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("fetches and parses the station data correctly", (done) => {
    const usa = initializeUSAWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: KGFKResponse });
      await moxios.requests.at(1).respondWith({ status: 200, response: KFARResponse });

      const currentConditions = usa.weather();
      expect(currentConditions).toStrictEqual(expectedResponse);
      done();
    });
  });

  it("filters out stations that aren't reporting temperature correctly (1/2)", (done) => {
    const usa = initializeUSAWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({
        status: 200,
        response: { ...KGFKResponse, properties: { ...KGFKResponse.properties, temperature: { value: null } } },
      });
      await moxios.requests.at(1).respondWith({ status: 200, response: KFARResponse });

      const currentConditions = usa.weather();
      expect(currentConditions).toStrictEqual([expectedResponse[1]]);
      done();
    });
  });

  it("filters out stations that aren't reporting temperature correctly (2/2)", (done) => {
    const usa = initializeUSAWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({
        status: 200,
        response: { ...KGFKResponse, properties: { ...KGFKResponse.properties, temperature: null } },
      });
      await moxios.requests.at(1).respondWith({ status: 200, response: KFARResponse });

      const currentConditions = usa.weather();
      expect(currentConditions).toStrictEqual([expectedResponse[1]]);
      done();
    });
  });

  it("filters out stations that aren't reporting conditions correctly (1/2)", (done) => {
    const usa = initializeUSAWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: KGFKResponse });
      await moxios.requests.at(1).respondWith({
        status: 200,
        response: { ...KFARResponse, properties: { ...KFARResponse.properties, textDescription: "Unknown precip" } },
      });

      const currentConditions = usa.weather();
      expect(currentConditions).toStrictEqual([expectedResponse[0]]);
      done();
    });
  });

  it("filters out stations that aren't reporting conditions correctly (2/2)", (done) => {
    const usa = initializeUSAWeather();

    moxios.wait(async () => {
      await moxios.requests.at(0).respondWith({ status: 200, response: KGFKResponse });
      await moxios.requests.at(1).respondWith({
        status: 200,
        response: { ...KFARResponse, properties: { ...KFARResponse.properties, textDescription: null } },
      });

      const currentConditions = usa.weather();
      expect(currentConditions).toStrictEqual([expectedResponse[0]]);
      done();
    });
  });
});
