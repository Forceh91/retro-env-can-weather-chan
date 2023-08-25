/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useLastMonth } from "hooks/lastMonth";
import lastMonthResponse from "./testdata/hooks/lastMonth.json";

const initializeHook = () => renderHook(() => useLastMonth())?.result?.current;

describe("Last month hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the config state", async () => {
    const { lastMonth, fetchLastMonth } = initializeHook();
    expect(lastMonth).toBeUndefined();
    expect(fetchLastMonth).toBeDefined();
  });

  it("fetches when the fetchLastMonth function is called", () => {
    const { fetchLastMonth } = initializeHook();
    fetchLastMonth();
    expect(moxios.requests.count()).toBeGreaterThan(0);
  });

  it("stores the init response in state", () => {
    const { lastMonth, fetchLastMonth } = initializeHook();
    fetchLastMonth();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: lastMonthResponse });
      expect(lastMonth).toStrictEqual(lastMonthResponse);
      expect(fetchLastMonth).toBeDefined();
    });
  });

  it("handles an empty 2xx state", () => {
    const { lastMonth, fetchLastMonth } = initializeHook();
    fetchLastMonth();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(lastMonth).toStrictEqual(null);
      expect(fetchLastMonth).toBeDefined();
    });
  });

  it("handles a 4xx error state", () => {
    const { lastMonth, fetchLastMonth } = initializeHook();
    fetchLastMonth();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(lastMonth).toStrictEqual(null);
      expect(fetchLastMonth).toBeDefined();
    });
  });

  it("handles a 5xx error state", () => {
    const { lastMonth, fetchLastMonth } = initializeHook();
    fetchLastMonth();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(lastMonth).toStrictEqual(null);
      expect(fetchLastMonth).toBeDefined();
    });
  });
});
