import moxios from "moxios";
import axios from "lib/backendAxios";
import { getECCCAirQualityStations } from "lib/eccc/airQualityStations";
import airQualityStations from "./testdata/ecccData/airQualityStationList";

const search = "toro";

describe("AQHI station list", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("parses data correctly and gives back the expected filtered set", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: airQualityStations }).then(() => {
        expect(stations).toStrictEqual([
          {
            code: "FEUZB",
            name: "Toronto",
            zone: "ont",
          },
          {
            code: "FCWYG",
            name: "Toronto Downtown",
            zone: "ont",
          },
          {
            code: "FDQBU",
            name: "Toronto East",
            zone: "ont",
          },
          {
            code: "FDQBX",
            name: "Toronto North",
            zone: "ont",
          },
          {
            code: "FCKTB",
            name: "Toronto West",
            zone: "ont",
          },
        ]);
      });
    });

    const stations = await getECCCAirQualityStations(search);
  });

  it("handles a 4xx response correctly", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 400 });
    });

    let stations;
    try {
      stations = await getECCCAirQualityStations(search);
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
      stations = await getECCCAirQualityStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (1)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<?xml>" });
    });

    let stations;
    try {
      stations = await getECCCAirQualityStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (2)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<dataFile/>" });
    });

    let stations;
    try {
      stations = await getECCCAirQualityStations(search);
    } catch {
      expect(stations).toBeUndefined();
    }
  });

  it("handles a malformed 2xx response correctly (3)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: "<dataFile><EC_administrativeZone/></dataFile>" }).then(() => {
        expect(stations).toStrictEqual([]);
      });
    });

    const stations = await getECCCAirQualityStations(search);
  });

  it("handles a malformed 2xx response correctly (4)", async () => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent
        .respondWith({ status: 200, response: "<dataFile><EC_administrativeZone/><regionList/></dataFile>" })
        .then(() => {
          expect(stations).toStrictEqual([]);
        });
    });

    const stations = await getECCCAirQualityStations(search);
  });
});
