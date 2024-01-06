/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useSunspots } from "hooks/sunspots";
import sunspotsResponse from "./testdata/hooks/sunspots.json";

const initializeHook = () => renderHook(() => useSunspots())?.result?.current;

describe("Sunspots hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { sunspots } = initializeHook();
    expect(sunspots).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { sunspots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: sunspotsResponse });
      expect(sunspots).toStrictEqual(sunspotsResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { sunspots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(sunspots).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { sunspots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(sunspots).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { sunspots } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(sunspots).toStrictEqual(null);
    });
  });
});
