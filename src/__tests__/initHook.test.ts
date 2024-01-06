/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useConfig } from "hooks/init";
import initResponse from "./testdata/hooks/init.json";

const initializeHook = () => renderHook(() => useConfig())?.result?.current;

describe("Initilization hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the config state", async () => {
    const { config } = initializeHook();
    expect(config).toBeUndefined();
  });

  it("fetches at every interval", () => {
    jest.useFakeTimers();
    initializeHook();
    jest.advanceTimersToNextTimer();
    expect(moxios.requests.count()).toBeGreaterThan(1);
  });

  it("stores the init response in state", () => {
    const { config } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: initResponse });
      expect(config).toStrictEqual(initResponse);
    });
  });

  it("handles an empty 2xx state", () => {
    const { config } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(config).toStrictEqual(null);
    });
  });

  it("handles a 4xx error state", () => {
    const { config } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(config).toStrictEqual(null);
    });
  });

  it("handles a 5xx error state", () => {
    const { config } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(config).toStrictEqual(null);
    });
  });
});
