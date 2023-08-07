import moxios from "moxios";
import axios from "lib/backendAxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ historicalDataStationID: 51459 }),
}));

import { initializeHistoricalTempPrecip } from "lib/eccc/historicalTempPrecip";
import * as season from "lib/date/season";
import historicalData2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-data";
import historicalData2023 from "./testdata/ecccData/historicaltempprecip/TO-2023-data";
import expectedTO2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-expected.json";

describe("historical temp/precip", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("retrieves last year temps correctly", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.lastYearTemperatures();
        expect(response).toStrictEqual(expectedTO2022.temperatures);
        done();
      });
    });
  });

  it("retrieves season precip data correctly (summer)", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.seasonPrecipData();
        expect(response).toStrictEqual(expectedTO2022.precipitation.summer);
        done();
      });
    });
  });

  it("retrieves season precip data correctly (winter)", (done) => {
    const spy = jest.spyOn(season, "getIsWinterSeason");
    spy.mockReturnValue(true);

    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.seasonPrecipData();
        expect(response).toStrictEqual(expectedTO2022.precipitation.winter);
        spy.mockRestore();
        done();
      });
    });
  });

  it("retrieves yesterday precip data correctly", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.yesterdayPrecipData();
        expect(response).toStrictEqual(expectedTO2022.precipitation.yesterday);
        done();
      });
    });
  });

  it("doesn't generate last month's summary if it's past the start of the month", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.lastMonthSummary();
        expect(response).toStrictEqual(null);
        done();
      });
    });
  });

  it("create's last month summary correctly", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 2));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.lastMonthSummary();
        expect(response).toStrictEqual(expectedTO2022.lastMonth);
        done();
      });
    });
  });
});
