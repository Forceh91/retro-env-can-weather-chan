import moxios from "moxios";
import axios from "lib/backendAxios";
import { mockTorontoConfig, mockAMQP } from "./configMocks";

mockTorontoConfig();
mockAMQP();

import { initializeCurrentConditions } from "lib/eccc/conditions";
import ecccConditions from "./testdata/ecccData/conditions/s0000458_e";
import ecccConditionsWithGust from "./testdata/ecccData/conditions/s0000458_e_gusting";
import ecccConditionsWithCalmWind from "./testdata/ecccData/conditions/s0000458_e_calm";
import ecccConditionsWithWindchill from "./testdata/ecccData/conditions/s0000458_e_windchill";
import { WeatherStation } from "types/condition.types";
import { addMinutes, parseISO } from "date-fns";

const expectedObserved: WeatherStation = require("./testdata/ecccData/conditions/s0000458_e.json");
const expectedObservedWithGust: WeatherStation = require("./testdata/ecccData/conditions/s0000458_e_gusting.json");
const expectedObservedWithCalmWind: WeatherStation = require("./testdata/ecccData/conditions/s0000458_e_calm.json");
const expectedObservedWithWindchill: WeatherStation = require("./testdata/ecccData/conditions/s0000458_e_windchill.json");
const baseExpectedConditionResponse = {
  observationID: expectedObserved.observationID,
  city: expectedObserved.city,
  stationTime: expectedObserved.stationTime,
  stationID: expectedObserved.stationID,
};

describe("CurrentConditions", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("returns the correct data when 'observed' is asked for", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditions }).then(() => {
        const observed = conditions.observed();
        expect(observed).toEqual({
          ...expectedObserved,
          almanac: {
            ...expectedObserved.almanac,
            temperatures: { ...expectedObserved.almanac.temperatures, lastYearMin: null, lastYearMax: null },
          },
        });
        done();
      });
    });
  });

  it("returns the correct data when 'forecast' is asked for", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditions }).then(() => {
        const forecast = conditions.forecast();
        expect(forecast).toStrictEqual({
          ...baseExpectedConditionResponse,
          forecast: expectedObserved.forecast,
        });
        done();
      });
    });
  });

  it("returns the correct data when 'almanac' is asked for", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditions }).then(() => {
        const almanac = conditions.almanac();
        expect(almanac).toEqual({
          ...baseExpectedConditionResponse,
          almanac: {
            ...expectedObserved.almanac,
            temperatures: { ...expectedObserved.almanac.temperatures, lastYearMin: null, lastYearMax: null },
          },
        });
        done();
      });
    });
  });

  it("returns the correct date when asking for the observed date time", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditions }).then(() => {
        const observedDateTime = conditions.observedDateTime();
        expect(observedDateTime).toStrictEqual(parseISO(expectedObserved.stationTime.observedDateTime));
        done();
      });
    });
  });

  it("returns the correct date when asking for the observed date time at station", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditions }).then(() => {
        const observedDateTimeAtStation = conditions.observedDateTimeAtStation();
        expect(observedDateTimeAtStation).toStrictEqual(
          addMinutes(
            parseISO(expectedObserved.stationTime.observedDateTime),
            expectedObserved.stationTime.stationOffsetMinutesFromLocal
          )
        );
        done();
      });
    });
  });

  it("handles gusting wind from eccc", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditionsWithGust }).then(() => {
        const observed = conditions.observed();
        expect(observed.observed).toEqual(expectedObservedWithGust.observed);
        done();
      });
    });
  });

  it("handles calm wind from eccc", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditionsWithCalmWind }).then(() => {
        const observed = conditions.observed();
        expect(observed.observed).toEqual(expectedObservedWithCalmWind.observed);
        done();
      });
    });
  });

  it("handles windchill calculated from eccc conditions", (done) => {
    const conditions = initializeCurrentConditions();

    moxios.wait(() => {
      const mostRecentRequest = moxios.requests.mostRecent();
      mostRecentRequest.respondWith({ status: 200, response: ecccConditionsWithWindchill }).then(() => {
        const observed = conditions.observed();
        expect(observed.observed).toEqual(expectedObservedWithWindchill.observed);
        done();
      });
    });
  });
});
