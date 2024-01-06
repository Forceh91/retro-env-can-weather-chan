/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useAirQuality } from "hooks/airQuality";
import airQualityResponse from "./testdata/hooks/airQuality.json";

const initializeHook = () => renderHook(() => useAirQuality())?.result?.current;

describe("Province tracking hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { airQuality } = initializeHook();
    expect(airQuality).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: airQualityResponse });
      expect(airQuality).toStrictEqual(airQualityResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a malformed 2xx response (1)", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: { showWarning: false, textValue: "Good" } });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a malformed 2xx response (2)", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: null });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a malformed 2xx response (3)", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: { value: "" } });
      expect(airQuality).toStrictEqual(null);
    });
  });

  it("handles a malformed 2xx response (4)", () => {
    const { airQuality } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: { value: null } });
      expect(airQuality).toStrictEqual(null);
    });
  });
});
