import moxios from "moxios";
import axios from "lib/backendAxios";
import { initializeAirQuality } from "lib/eccc/airQuality";
import airQualityResponse from "./testdata/airquality/response";
import airQualityObservation from "./testdata/airquality/expected";
import { doesAQHINeedWarning, getTextSummaryOfAQHI } from "lib/airquality/utils";
import { AIR_QUALITY_BAD, AIR_QUALITY_FAIR, AIR_QUALITY_POOR } from "consts";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ airQualityStation: "GBEIN" }),
}));

describe("AQHI Observation", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("initializes with a blank reading", () => {
    const airQuality = initializeAirQuality();
    expect(airQuality.observation).toBeNull();
  });

  it("parses xml correctly and stores the aqhi observation", (done) => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: airQualityResponse }).then(() => {
        expect(airQuality.observation).toStrictEqual(airQualityObservation);
        done();
      });
    });

    const airQuality = initializeAirQuality();
  });

  it("handles a 4xx response", (done) => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 404 }).then(() => {
        expect(airQuality.observation).toBeNull();
        done();
      });
    });

    const airQuality = initializeAirQuality();
  });

  it("handles a 5xx response", (done) => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 500 }).then(() => {
        expect(airQuality.observation).toBeNull();
        done();
      });
    });

    const airQuality = initializeAirQuality();
  });

  it("handles a malformed 2xx response (1)", (done) => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent.respondWith({ status: 200, response: `<conditionAirQuality/>` }).then(() => {
        expect(airQuality.observation).toStrictEqual({ day: null, hour: null, month: null, isPM: false, value: null });
        done();
      });
    });

    const airQuality = initializeAirQuality();
  });

  it("handles a malformed 2xx response (2)", (done) => {
    moxios.wait(() => {
      const mostRecent = moxios.requests.mostRecent();
      if (!mostRecent) return;

      mostRecent
        .respondWith({ status: 200, response: `<conditionAirQuality><dateStamp/></conditionAirQuality>` })
        .then(() => {
          expect(airQuality.observation).toStrictEqual({
            day: NaN,
            hour: NaN,
            month: NaN,
            isPM: false,
            value: null,
          });
          done();
        });
    });

    const airQuality = initializeAirQuality();
  });
});

describe("AQHI Utils", () => {
  it("states that a warning is needed", () => {
    expect(doesAQHINeedWarning(1)).toBeFalsy();
    expect(doesAQHINeedWarning(AIR_QUALITY_FAIR)).toBeTruthy();
    expect(doesAQHINeedWarning(AIR_QUALITY_POOR)).toBeTruthy();
    expect(doesAQHINeedWarning(AIR_QUALITY_BAD)).toBeTruthy();
  });

  it("gives the correct summary for the AQHI value", () => {
    expect(getTextSummaryOfAQHI(1)).toBe("Good");
    expect(getTextSummaryOfAQHI(AIR_QUALITY_FAIR)).toBe("Fair");
    expect(getTextSummaryOfAQHI(AIR_QUALITY_POOR)).toBe("Poor");
    expect(getTextSummaryOfAQHI(AIR_QUALITY_BAD)).toBe("Poor");
    expect(getTextSummaryOfAQHI(AIR_QUALITY_BAD + 1)).toBe("Bad");
  });
});
