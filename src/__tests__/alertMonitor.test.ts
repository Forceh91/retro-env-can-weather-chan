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
import thunderstorm_warning, {
  secondAlert,
  thunderstormWarningEnded,
} from "./testdata/ecccData/cap/thunderstorm_warning";
import expectedAlertMonitorResponse from "./testdata/ecccData/cap/alertmonitor_expected.json";
import fs from "fs";

describe("Alert Monitor", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => {
    moxios.uninstall(axios);
    fakeEventEmitter.removeAllListeners();
    jest.restoreAllMocks();
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

  it("stores the alert urls to the txt file to load", (done) => {
    const spy = jest.spyOn(fs, "writeFile");
    const capURL = "https://dd.weather.gc.ca/alerts/cap/20230805/LAND/22/T_ONCN00_C_LAND_202308052241_1573485680.cap";
    initializeAlertMonitor(true);
    fakeEventEmitter.emit("message", "", capURL);

    moxios.wait(() => {
      // fake an alert coming in
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: secondAlert }).then(() => {
        // and make sure the save cap files was called
        expect(spy).toHaveBeenCalled();
        done();
      });
    });
  });

  it("loads the alert urls from the txt file on initializatin", () => {
    const spy = jest.spyOn(fs, "readFileSync");
    initializeAlertMonitor(true);
    expect(spy).toHaveBeenCalled();
  });

  it("removes cap files if they are mentioned by newer cap files", (done) => {
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
      mostRecentRequest.respondWith({ status: 200, response: thunderstormWarningEnded }).then(() => {
        expect(
          alertMonitor.alerts().alerts.findIndex((alert) => alert.identifier === "urn:oid:2.49.0.1.124.1211373515.2023")
        ).toBe(-1);
        expect(alertMonitor.alerts().alerts).toHaveLength(1);
        done();
      });
    });
  });

  it("gives a correct object when there's no alerts active", () => {
    const alertMonitor = initializeAlertMonitor(true);
    expect(alertMonitor.alerts().alerts).toHaveLength(0);
  });
});
