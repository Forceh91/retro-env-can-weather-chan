/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useAlerts } from "hooks/alerts";
import alertResponse from "./testdata/hooks/alerts.json";

const initializeHook = () => renderHook(() => useAlerts())?.result?.current;

describe("Alerts hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the alert state", async () => {
    const { alerts, hasFetched, mostImportantAlert } = initializeHook();
    expect(alerts).toHaveLength(0);
    expect(hasFetched).toBeFalsy();
    expect(mostImportantAlert).toBeNull();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { alerts, mostImportantAlert, hasFetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: alertResponse });
      expect(alerts).toStrictEqual(alertResponse.alerts);
      expect(mostImportantAlert).toStrictEqual(alertResponse.alerts[0]);
      expect(hasFetched).toBeTruthy();
    });
  });

  it("handles an empty 2xx state", () => {
    const { alerts, mostImportantAlert, hasFetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(alerts).toHaveLength(0);
      expect(hasFetched).toBeTruthy();
      expect(mostImportantAlert).toBeNull();
    });
  });

  it("handles a 4xx error state", () => {
    const { alerts, mostImportantAlert, hasFetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(alerts).toHaveLength(0);
      expect(hasFetched).toBeTruthy();
      expect(mostImportantAlert).toBeNull();
    });
  });

  it("handles a 5xx error state", () => {
    const { alerts, mostImportantAlert, hasFetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(alerts).toHaveLength(0);
      expect(hasFetched).toBeTruthy();
      expect(mostImportantAlert).toBeNull();
    });
  });
});
