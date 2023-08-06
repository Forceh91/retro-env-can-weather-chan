import moxios from "moxios";
import axios from "lib/backendAxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ primaryLocation: { province: "ON" } }),
}));

import { initializeCanadaProvincialHotColdSpot } from "lib/eccc/canadaHotColdSpot";
import canadaHotColdSpotData from "./testdata/ecccData/hotcold/today_on_20230806_e";
import expectedCanadaHotColdSpotData from "./testdata/ecccData/hotcold/expected.json";

describe("canada hot cold spot", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("fetches the hot/cold spot correctly", (done) => {
    const hotColdSpot = initializeCanadaProvincialHotColdSpot(true);

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: canadaHotColdSpotData }).then(() => {
        const response = hotColdSpot.hotColdSpots();
        const { hotSpot, coldSpot } = response;

        expect(hotSpot).toStrictEqual(expectedCanadaHotColdSpotData.hotSpot);
        expect(coldSpot).toStrictEqual(expectedCanadaHotColdSpotData.coldSpot);
        expect(response.lastUpdated).not.toBeFalsy();
        done();
      });
    });
  });
});
