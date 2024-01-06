/**
 * @jest-environment jsdom
 */

import { renderHook } from "@testing-library/react";
import moxios from "moxios";
import axios from "lib/axios";
import { useSaveConfigOption } from "hooks/saveConfigOption";

const initializeHook = (endpoint: string = "configOption") =>
  renderHook(() => useSaveConfigOption(endpoint))?.result?.current;

describe("Season hook hook", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("gives us the hook state", async () => {
    const { saveConfigOption, isSaving, wasSuccess, wasError } = initializeHook("");
    expect(saveConfigOption).toBeDefined();
    expect(isSaving).toBeFalsy();
    expect(wasSuccess).toBeFalsy();
    expect(wasError).toBeFalsy();
  });

  it("doesn't fetch when the saveConfigOption function is called without and endpoint", () => {
    const { saveConfigOption } = initializeHook("");
    saveConfigOption({});
    expect(moxios.requests.count()).toEqual(0);
  });

  it("fetches when the saveConfigOption function is called and has an endpoint", () => {
    const { saveConfigOption } = initializeHook("configOption");
    saveConfigOption({});
    expect(moxios.requests.count()).toBeGreaterThan(0);
  });

  it("handles an 2xx state", () => {
    const { saveConfigOption, isSaving, wasSuccess, wasError } = initializeHook();
    saveConfigOption({});

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 200 });
      expect(isSaving).toBeFalsy();
      expect(wasSuccess).toBeTruthy();
      expect(wasError).toBeFalsy();
    });
  });

  it("handles a 4xx error state", () => {
    const { saveConfigOption, isSaving, wasSuccess, wasError } = initializeHook();
    saveConfigOption({});

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 400 });
      expect(isSaving).toBeFalsy();
      expect(wasSuccess).toBeFalsy();
      expect(wasError).toBeTruthy();
    });
  });

  it("handles a 5xx error state", () => {
    const { saveConfigOption, isSaving, wasSuccess, wasError } = initializeHook();
    saveConfigOption({});

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      request.respondWith({ status: 500 });
      expect(isSaving).toBeFalsy();
      expect(wasSuccess).toBeFalsy();
      expect(wasError).toBeTruthy();
    });
  });
});
