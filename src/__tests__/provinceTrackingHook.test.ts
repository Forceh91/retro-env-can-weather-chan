/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useProvinceTracking } from "hooks/provincetracking";
import provinceTrackingResponse from "./testdata/hooks/provinceTracking.json";

const initializeHook = () => renderHook(() => useProvinceTracking())?.result?.current;

describe("Province tracking hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the config state", async () => {
    const { provinceTracking } = initializeHook();
    expect(provinceTracking).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { provinceTracking } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: provinceTrackingResponse });
      expect(provinceTracking).toStrictEqual(provinceTrackingResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { provinceTracking } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(provinceTracking).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { provinceTracking } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(provinceTracking).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { provinceTracking } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(provinceTracking).toStrictEqual(null);
    });
  });
});
