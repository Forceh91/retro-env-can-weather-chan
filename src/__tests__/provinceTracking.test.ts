import axios from "lib/backendAxios";
import moxios from "moxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({
    provinceHighLowEnabled: true,
    provinceStations: [
      { name: "Toronto", code: "ON/s0000458" },
      { name: "Ottawa", code: "ON/s0000623" },
    ],
  }),
}));

jest.mock("lib/eccc", () => ({
  initializeCurrentConditions: () => ({
    observedDateTimeAtStation: jest.fn(() => new Date()),
  }),
}));

jest.mock("fs");

import { initializeProvinceTracking } from "lib/provincetracking/provinceTracking";
import fakeTorontoWeather, { fakeTorontoWeatherLowTemp } from "./testdata/ecccData/provincetracking/fakeTorontoWeather";
import fakeOttawaWeather, { fakeOttawaWeatherLowTemp } from "./testdata/ecccData/provincetracking/fakeOttawaWeather";
import expectedData from "./testdata/ecccData/provincetracking/expected";
import fakeStoredData from "./testdata/ecccData/provincetracking/fakeStoredData.json";
import fs from "fs";

const dayTimeDate = new Date(2023, 7, 10, 17, 22);
const nightTimeDate = new Date(2023, 7, 10, 22, 22);

describe("Provincial temp/precip tracking", () => {
  beforeEach(() => {
    moxios.install(axios);
  });

  afterEach(() => {
    jest.useRealTimers();
    moxios.uninstall(axios);
  });

  it("fetches data from the api correctly", (done) => {
    const saveFileSpy = jest.spyOn(fs, "writeFile");
    const loadFileSpy = jest.spyOn(fs, "readFileSync");

    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);

    const provinceTracking = initializeProvinceTracking();
    moxios.wait(async () => {
      jest.useRealTimers();

      await moxios.requests.at(0).respondWith({ status: 200, response: fakeTorontoWeather });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeOttawaWeather });

      expect(provinceTracking.provinceTracking().tracking).toStrictEqual(expectedData.tracking);
      expect(provinceTracking.provinceTracking().isOvernight).toBe(true);
      expect(saveFileSpy).toHaveBeenCalled();
      expect(loadFileSpy).toHaveBeenCalled();

      saveFileSpy.mockRestore();
      loadFileSpy.mockRestore();
      done();
    });
    jest.advanceTimersToNextTimer();
  });

  it("fetches data periodically", () => {
    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);

    initializeProvinceTracking();
    const spy = jest.spyOn(axios, "get");

    jest.advanceTimersToNextTimer();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });

  it("udpates min/max temps correctly (day time)", (done) => {
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify(fakeStoredData));

    moxios.wait(async () => {
      jest.useRealTimers();

      await moxios.requests.at(0).respondWith({ status: 200, response: fakeOttawaWeather });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeTorontoWeather });

      const { tracking } = provinceTracking.provinceTracking();
      expect(tracking[0].maxTemp).toBe(fakeStoredData[0].maxTemp);
      expect(tracking[0].minTemp).toBe(fakeStoredData[0].minTemp);

      // ottawa gets told TOs temps so it should match
      expect(tracking[1].maxTemp).toBe(26.4);
      expect(tracking[1].minTemp).toBe(fakeStoredData[1].minTemp);

      done();
    });

    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);
    const provinceTracking = initializeProvinceTracking();
  });

  it("udpates min/max temps correctly (night time)", (done) => {
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify(fakeStoredData));

    moxios.wait(async () => {
      jest.useRealTimers();
      await moxios.requests.at(0).respondWith({ status: 200, response: fakeTorontoWeatherLowTemp });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeOttawaWeatherLowTemp });

      const { tracking } = provinceTracking.provinceTracking();
      expect(tracking[0].maxTemp).toBe(fakeStoredData[0].maxTemp);
      expect(tracking[0].minTemp).toBe(16.4);

      // ottawa gets told TOs temps so it should match
      expect(tracking[1].maxTemp).toBe(fakeStoredData[1].maxTemp);
      expect(tracking[1].minTemp).toBe(15.8);

      done();
    });

    jest.useFakeTimers();
    jest.setSystemTime(nightTimeDate);
    const provinceTracking = initializeProvinceTracking();
  });

  it("correctly tracks high temp and displays temp", () => {
    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);

    const provinceTracking = initializeProvinceTracking();
    expect(provinceTracking.provinceTracking().isOvernight).toBe(true);
  });

  it("correctly tracks min temp and displays max temp", () => {
    jest.useFakeTimers();
    jest.setSystemTime(nightTimeDate);

    const provinceTracking = initializeProvinceTracking();
    expect(provinceTracking.provinceTracking().isOvernight).toBe(false);
  });

  it("loads data from json correctly", () => {
    jest.spyOn(fs, "readFileSync").mockImplementationOnce(() => JSON.stringify(fakeStoredData));

    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);
    const provinceTracking = initializeProvinceTracking();
    expect(provinceTracking.provinceTracking().tracking).toStrictEqual(fakeStoredData);
  });

  it("resets and switches over display/tracking from max->min correctly", () => {
    jest.useFakeTimers();
    jest.setSystemTime(dayTimeDate);

    const provinceTracking = initializeProvinceTracking();
    moxios.wait(async () => {
      jest.useRealTimers();

      await moxios.requests.at(0).respondWith({ status: 200, response: fakeTorontoWeather });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeOttawaWeather });

      jest.useFakeTimers();
      jest.setSystemTime(nightTimeDate);
      jest.advanceTimersToNextTimer();

      const { tracking, isOvernight } = provinceTracking.provinceTracking();
      expect(isOvernight).toBe(false);

      expect(tracking[0].displayTemp).toBe(26.4);
      expect(tracking[0].minTemp).toBe(Math.min());

      expect(tracking[1].displayTemp).toBe(25.8);
      expect(tracking[1].minTemp).toBe(Math.min());
    });
  });

  it("resets and switches over display/tracking from min->max correctly", () => {
    jest.useFakeTimers();
    jest.setSystemTime(nightTimeDate);

    const provinceTracking = initializeProvinceTracking();
    moxios.wait(async () => {
      jest.useRealTimers();

      await moxios.requests.at(0).respondWith({ status: 200, response: fakeTorontoWeather });
      await moxios.requests.at(1).respondWith({ status: 200, response: fakeOttawaWeather });

      jest.useFakeTimers();
      jest.setSystemTime(dayTimeDate);
      jest.advanceTimersToNextTimer();

      const { tracking, isOvernight } = provinceTracking.provinceTracking();
      expect(isOvernight).toBe(true);

      expect(tracking[0].displayTemp).toBe("M");
      expect(tracking[0].maxTemp).toBe(Math.max());

      expect(tracking[1].displayTemp).toBe("M");
      expect(tracking[1].maxTemp).toBe(Math.max());
    });
  });
});
