/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useCanadaHotColdSpots } from "hooks/hotColdSpots";
import hotColdSpotsResponse from "./testdata/hooks/hotColdSpots.json";

const initializeHook = () => renderHook(() => useCanadaHotColdSpots())?.result?.current;

describe("Hot/Cold spots hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { hotColdSpots } = initializeHook();
    expect(hotColdSpots).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { hotColdSpots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: hotColdSpotsResponse });
      expect(hotColdSpots).toStrictEqual(hotColdSpotsResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { hotColdSpots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(hotColdSpots).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { hotColdSpots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(hotColdSpots).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { hotColdSpots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(hotColdSpots).toStrictEqual(null);
    });
  });
});
