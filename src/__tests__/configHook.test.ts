/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useChannelCurrentConfig } from "hooks/config";
import configResponse from "./testdata/hooks/config.json";

const initializeHook = () => renderHook(() => useChannelCurrentConfig())?.result?.current;

describe("Initilization hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the config state", async () => {
    const { config, fetched } = initializeHook();
    expect(config).toBeUndefined();
    expect(fetched).toBeFalsy();
  });

  it("fetches on mounted", () => {
    initializeHook();
    moxios.wait(() => {
      expect(moxios.requests.count()).toBeGreaterThan(1);
    });
  });

  it("stores the init response in state", () => {
    const { config, fetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: configResponse });
      expect(config).toStrictEqual(configResponse);
      expect(fetched).toBeTruthy();
    });
  });

  it("handles an empty 2xx state", () => {
    const { config, fetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(config).toStrictEqual(null);
      expect(fetched).toBeTruthy();
    });
  });

  it("handles a 4xx error state", () => {
    const { config, fetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(config).toStrictEqual(null);
      expect(fetched).toBeTruthy();
    });
  });

  it("handles a 5xx error state", () => {
    const { config, fetched } = initializeHook();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(config).toStrictEqual(null);
      expect(fetched).toBeTruthy();
    });
  });
});
