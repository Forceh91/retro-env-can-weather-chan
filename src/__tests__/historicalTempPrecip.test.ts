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
import historicalData2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-data";
import historicalData2023 from "./testdata/ecccData/historicaltempprecip/TO-2023-data";
import expectedTO2022 from "./testdata/ecccData/historicaltempprecip/TO-2022-expected.json";

const SUMMER_2023_DATE = new Date(2023, 7, 7);
/** Mid-winter asOf yields the same Oct 2→Apr 1 bulk window as a forced-winter summer date (#854). */
const WINTER_2023_DATE = new Date(2023, 1, 15);

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
    moxios.wait(async () => {
      jest.advanceTimersByTimeAsync(500);
      await moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      await moxios.requests.at(1).respondWith({ status: 200, response: historicalData2023 });

      expect(historicalData.seasonPrecipData()).toStrictEqual(expectedTO2022.precipitation.winter);
      done();
    });

    jest.useFakeTimers();
    jest.setSystemTime(WINTER_2023_DATE);

    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(WINTER_2023_DATE);
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

  it("generates last month's summary after the first day of the month", (done) => {
    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2023, 7, 7));

    moxios.wait(() => {
      moxios.requests.at(0).respondWith({ status: 200, response: historicalData2022 });
      const request = moxios.requests.mostRecent();
      request?.respondWith({ status: 200, response: historicalData2023 }).then(() => {
        const response = historicalData.lastMonthSummary();
        expect(response).not.toBeNull();
        expect(response?.averageHigh).toBeDefined();
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

  it("uses prior leap Feb 29 temps for last-year almanac (#671)", (done) => {
    const climateXml = (year: number, rows: string) =>
      `<?xml version="1.0"?><climatedata><stationdata day="28" month="2" year="${year}"><maxtemp>9.9</maxtemp><mintemp>-9.9</mintemp></stationdata>${rows}</climatedata>`;

    const leap2020 = climateXml(
      2020,
      `<stationdata day="29" month="2" year="2020"><maxtemp>0.1</maxtemp><mintemp>-7.5</mintemp></stationdata>`
    );
    const y2023 = climateXml(2023, "");
    const y2024 = climateXml(2024, "");

    moxios.wait(async () => {
      // years fetched sorted: 2020, 2023, 2024
      expect(moxios.requests.count()).toBe(3);
      const byYear = [0, 1, 2].map((i) => {
        const url = moxios.requests.at(i).url ?? "";
        const m = url.match(/Year=(\d+)/);
        return { i, year: Number(m?.[1]) };
      });
      expect(byYear.map((r) => r.year).sort()).toEqual([2020, 2023, 2024]);

      const bodyFor = (year: number) => (year === 2020 ? leap2020 : year === 2023 ? y2023 : y2024);
      await Promise.all(byYear.map(({ i, year }) => moxios.requests.at(i).respondWith({ status: 200, response: bodyFor(year) })));

      expect(historicalData.lastYearTemperatures()).toStrictEqual({
        max: { value: 0.1, unit: "C" },
        min: { value: -7.5, unit: "C" },
      });
      done();
    });

    const historicalData = initializeHistoricalTempPrecip();
    historicalData.fetchLastTwoYearsOfData(new Date(2024, 1, 29));
  });
});
