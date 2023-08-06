import { EventEmitter } from "stream";

const fakeEventEmitter = new EventEmitter();
jest.mock("lib/amqp/sarra-canada-amqp", () => ({
  ...jest.requireActual("lib/amqp/sarra-canada-amqp"),
  listen: () => ({ emitter: fakeEventEmitter, connection: jest.fn() }),
}));
jest.mock("lib/eccc/conditions", () => ({
  initializeCurrentConditions: () => ({ stationLatLong: { lat: 49.5235, long: -90.0178 } }),
}));
jest.mock("fs");

import { initializeAlertMonitor } from "lib/eccc/alertMonitor";
import moxios from "moxios";
import axios from "lib/backendAxios";
import thunderstorm_warning, { secondAlert } from "./testdata/ecccData/cap/thunderstorm_warning";
import expectedAlertMonitorResponse from "./testdata/ecccData/cap/alertmonitor_expected.json";

describe("Alert Monitor", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => {
    moxios.uninstall(axios);
    fakeEventEmitter.removeAllListeners();
  });

  it("parses a cap file when one is received", (done) => {
    const alertMonitor = initializeAlertMonitor(true);
    fakeEventEmitter.emit("message", "", expectedAlertMonitorResponse.alerts[0].url);

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: thunderstorm_warning }).then(() => {
        expect(alertMonitor.alerts()).toStrictEqual(expectedAlertMonitorResponse);
        done();
      });
    });
  });

  it("stores two cap files into memory correctly", (done) => {
    const alertMonitor = initializeAlertMonitor(true);
    fakeEventEmitter.emit("message", "", expectedAlertMonitorResponse.alerts[0].url);
    fakeEventEmitter.emit(
      "message",
      "",
      "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052241_1573485680.cap"
    );

    moxios.wait(() => {
      // first one is the tstorm warning
      moxios.requests.at(0).respondWith({ status: 200, response: thunderstorm_warning });

      // most recent is the second alert in that file
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: secondAlert }).then(() => {
        expect(alertMonitor.alerts().alerts).toHaveLength(2);
        done();
      });
    });
  });
});
