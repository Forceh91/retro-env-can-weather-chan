/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useNationalWeather } from "hooks/national";
import nationalWeatherResponse from "./testdata/hooks/nationalWeather.json";

const initializeHook = () => renderHook(() => useNationalWeather())?.result?.current;

describe("National weather hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { nationalWeather } = initializeHook();
    expect(nationalWeather).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { nationalWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: nationalWeatherResponse });
      expect(nationalWeather).toStrictEqual(nationalWeatherResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { nationalWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(nationalWeather).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { nationalWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(nationalWeather).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { nationalWeather } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(nationalWeather).toStrictEqual(null);
    });
  });
});
