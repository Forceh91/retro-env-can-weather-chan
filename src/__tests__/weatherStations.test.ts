import moxios from "moxios";
import axios from "lib/backendAxios";
import { getECCCWeatherStations } from "lib/eccc/weatherStations";
import ecccWeatherStations from "./testdata/ecccData/ecccStationList";

const search = "Vale";

describe("ECCC weather station list", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("parses data correctly and gives back the expected filtered set", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: ecccWeatherStations }).then(() => {
        expect(stations).toStrictEqual([{ name: "Valemount", province: "BC", location: "s0000003" }]);
      });
    });

    const stations = await getECCCWeatherStations(search);
  });

  it("handles a 4xx response correctly", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 400 });
    });

    let stations;
    try {
      stations = await getECCCWeatherStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a 5xx response correctly", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 500 });
    });

    let stations;
    try {
      stations = await getECCCWeatherStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (1/3)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<?xml>" });
    });

    let stations;
    try {
      stations = await getECCCWeatherStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (2/3)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<siteList/>" });
    });

    let stations;
    try {
      stations = await getECCCWeatherStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (3/3)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<siteList><site/></siteList>" }).then(() => {
        expect(stations).toStrictEqual([]);
      });
    });

    const stations = await getECCCWeatherStations(search);
  });
});
