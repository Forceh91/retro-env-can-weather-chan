import moxios from "moxios";
import axios from "lib/backendAxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ climateNormals: { stationID: 5051, climateID: 6158350, province: "ON" } }),
}));

import { initializeClimateNormals } from "lib/eccc/climateNormals";
import climateNormalsData from "./testdata/ecccData/climatenormals/normals";
import expectedData from "./testdata/ecccData/climatenormals/expected.json";
import lastMonthExpectedData from "./testdata/ecccData/climatenormals/lastMonthExpected.json";

describe("climate normals", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("calculates precip correctly", (done) => {
    const normals = initializeClimateNormals(true);
    normals.fetchClimateNormals();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: climateNormalsData }).then(() => {
        const response = normals.getNormalPrecipForCurrentSeason();
        expect(response).toStrictEqual({ amount: expectedData.seasonPrecip.normal, unit: "mm" });
        done();
      });
    });
  });

  it("calculates last month correctly", (done) => {
    const normals = initializeClimateNormals(true);
    normals.fetchClimateNormals();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: climateNormalsData }).then(() => {
        const response = normals.getNormalsForLastMonth(new Date(2023, 7, 1));
        expect(response).toStrictEqual(lastMonthExpectedData);
        done();
      });
    });
  });

  it("doesn't give last month normals if its not the start of the month", (done) => {
    const normals = initializeClimateNormals(true);
    normals.fetchClimateNormals();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: climateNormalsData }).then(() => {
        const response = normals.getNormalsForLastMonth(new Date(2023, 7, 7));
        expect(response).toStrictEqual(null);
        done();
      });
    });
  });
});
