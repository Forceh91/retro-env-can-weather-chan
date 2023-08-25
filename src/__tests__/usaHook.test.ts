/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useUSAWeather } from "hooks/usa";
import usaWeatherResponse from "./testdata/hooks/usa.json";

const initializeHook = () => renderHook(() => useUSAWeather())?.result?.current;

describe("National weather hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { usaWeather } = initializeHook();
    expect(usaWeather).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { usaWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: usaWeatherResponse });
      expect(usaWeather).toStrictEqual(usaWeatherResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { usaWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(usaWeather).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { usaWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(usaWeather).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { usaWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(usaWeather).toStrictEqual(null);
    });
  });
});
