/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useSeason } from "hooks/season";
import seasonResponse from "./testdata/hooks/season.json";

const initializeHook = () => renderHook(() => useSeason())?.result?.current;

describe("Season hook hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { season, fetchSeason } = initializeHook();
    expect(season).toBeUndefined();
    expect(fetchSeason).toBeDefined();
  });

  it("fetches when the fetchSeason function is called", () => {
    const { fetchSeason } = initializeHook();
    fetchSeason();
    expect(moxios.requests.count()).toBeGreaterThan(0);
  });

  it("stores the init response in state", () => {
    const { season, fetchSeason } = initializeHook();
    fetchSeason();
    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200, response: seasonResponse });
      expect(season).toStrictEqual(seasonResponse);
      expect(fetchSeason).toBeDefined();
    });
  });

  it("handles an empty 2xx state", () => {
    const { season, fetchSeason } = initializeHook();
    fetchSeason();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(season).toStrictEqual(null);
      expect(fetchSeason).toBeDefined();
    });
  });

  it("handles a 4xx error state", () => {
    const { season, fetchSeason } = initializeHook();
    fetchSeason();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 404 });
      expect(season).toStrictEqual(null);
      expect(fetchSeason).toBeDefined();
    });
  });

  it("handles a 5xx error state", () => {
    const { season, fetchSeason } = initializeHook();
    fetchSeason();

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(season).toStrictEqual(null);
      expect(fetchSeason).toBeDefined();
    });
  });
});
