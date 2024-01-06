import moxios from "moxios";
import axios from "lib/backendAxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ historicalDataStationID: 51459 }),
}));

jest.mock("date-fns", () => ({
  ...jest.requireActual("date-fns"),
  isYesterday: jest.fn((date: Date) => {
    if (date.toISOString().includes("2023-08-06")) return true;
    return false;
  }),
}));

import { initializeHistoricalTempPrecip } from "lib/eccc/historicalTempPrecip";
import * as season from "lib/date/season";
import historicalData2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-data";
import historicalData2023 from "./testdata/ecccData/historicaltempprecip/TO-2023-data";
import expectedTO2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-expected.json";

const SUMMER_2023_DATE = new Date(2023, 7, 7);

describe("historical temp/precip", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => {
    moxios.uninstall(axios);
    jest.useRealTimers();
  });

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
    moxios.wait(async () => {
      jest.advanceTimersByTimeAsync(500);
      await moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      await moxios.requests.at(1).respondWith({ status: 200, response: historicalData2023 });

      expect(historicalData.seasonPrecipData()).toStrictEqual(expectedTO2022.precipitation.summer);
      done();
    });

    jest.useFakeTimers();
    jest.setSystemTime(SUMMER_2023_DATE);

    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(SUMMER_2023_DATE);
  });

  it("retrieves season precip data correctly (winter)", (done) => {
    jest.spyOn(season, "getIsWinterSeason").mockReturnValueOnce(true);

    moxios.wait(async () => {
      jest.advanceTimersByTimeAsync(500);
      await moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      await moxios.requests.at(1).respondWith({ status: 200, response: historicalData2023 });

      expect(historicalData.seasonPrecipData()).toStrictEqual(expectedTO2022.precipitation.winter);
      done();
    });

    jest.useFakeTimers();
    jest.setSystemTime(SUMMER_2023_DATE);

    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(SUMMER_2023_DATE);
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
