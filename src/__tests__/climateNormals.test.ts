import moxios from "moxios";
import axios from "lib/backendAxios";

jest.mock("lib/config/config", () => ({
  initializeConfig: () => ({ climateNormals: { stationID: 5051, climateID: 6158350, province: "ON" } }),
}));

import { initializeClimateNormals, parseClimateNormalsCsv } from "lib/eccc/climateNormals";

const CSV_COLUMNS = [
  "x",
  "y",
  "STATION_NAME",
  "CLIMATE_IDENTIFIER",
  "ID",
  "PERIOD",
  "CURRENT_FLAG",
  "NORMAL_CODE",
  "NORMAL_ID",
  "PUBLICATION_CODE",
  "DATE_CALCULATED",
  "FIRST_OCCURRENCE_DATE",
  "PROVINCE_CODE",
  "PERIOD_BEGIN",
  "PERIOD_END",
  "FIRST_YEAR",
  "FIRST_YEAR_NORMAL_PERIOD",
  "LAST_YEAR",
  "LAST_YEAR_NORMAL_PERIOD",
  "YEAR_COUNT_NORMAL_PERIOD",
  "TOTAL_OBS_COUNT",
  "OCCURRENCE_COUNT",
  "MAX_DURATION_MISSING_YEARS",
  "PERCENT_OF_POSSIBLE_OBS",
  "E_NORMAL_ELEMENT_NAME",
  "F_NORMAL_ELEMENT_NAME",
  "MONTH",
  "VALUE",
  "STN_ID",
] as const;

function makeCsvRow(overrides: Partial<Record<(typeof CSV_COLUMNS)[number], string>>): string {
  return CSV_COLUMNS.map((c) => overrides[c] ?? "").join(",");
}

/** Minimal CSV: Aug 7 2023 — season-to-date precip normal 46 mm; July normals for last-month block. */
const SYNTHETIC_NORMALS_CSV = [
  CSV_COLUMNS.join(","),
  makeCsvRow({
    CURRENT_FLAG: "Y",
    NORMAL_CODE: "A",
    NORMAL_ID: "56",
    MONTH: "4",
    VALUE: "10",
  }),
  makeCsvRow({
    CURRENT_FLAG: "Y",
    NORMAL_CODE: "A",
    NORMAL_ID: "56",
    MONTH: "5",
    VALUE: "10",
  }),
  makeCsvRow({
    CURRENT_FLAG: "Y",
    NORMAL_CODE: "A",
    NORMAL_ID: "56",
    MONTH: "6",
    VALUE: "10",
  }),
  makeCsvRow({
    CURRENT_FLAG: "Y",
    NORMAL_CODE: "A",
    NORMAL_ID: "56",
    MONTH: "7",
    VALUE: "10",
  }),
  makeCsvRow({
    CURRENT_FLAG: "Y",
    NORMAL_CODE: "A",
    NORMAL_ID: "56",
    MONTH: "8",
    VALUE: "31",
  }),
  makeCsvRow({ CURRENT_FLAG: "Y", NORMAL_CODE: "A", NORMAL_ID: "5", MONTH: "7", VALUE: "24" }),
  makeCsvRow({ CURRENT_FLAG: "Y", NORMAL_CODE: "A", NORMAL_ID: "8", MONTH: "7", VALUE: "14" }),
  makeCsvRow({ CURRENT_FLAG: "Y", NORMAL_CODE: "A", NORMAL_ID: "1", MONTH: "7", VALUE: "20" }),
].join("\n");

describe("parseClimateNormalsCsv", () => {
  it("indexes NORMAL_ID and MONTH into a lookup map", () => {
    const header = CSV_COLUMNS.join(",");
    const row1 = makeCsvRow({
      CURRENT_FLAG: "Y",
      NORMAL_CODE: "A",
      NORMAL_ID: "56",
      MONTH: "3",
      VALUE: "142.5",
    });
    const row2 = makeCsvRow({
      CURRENT_FLAG: "Y",
      NORMAL_CODE: "A",
      NORMAL_ID: "5",
      MONTH: "3",
      VALUE: "12.3",
    });
    const csv = `${header}\n${row1}\n${row2}\n`;
    const map = parseClimateNormalsCsv(csv);
    expect(map.get("56-3")).toBe(142.5);
    expect(map.get("5-3")).toBe(12.3);
  });

  it("skips rows that are not current or not NORMAL_CODE A", () => {
    const header = CSV_COLUMNS.join(",");
    const skip1 = makeCsvRow({
      CURRENT_FLAG: "N",
      NORMAL_CODE: "A",
      NORMAL_ID: "1",
      MONTH: "1",
      VALUE: "9",
    });
    const skip2 = makeCsvRow({
      CURRENT_FLAG: "Y",
      NORMAL_CODE: "B",
      NORMAL_ID: "1",
      MONTH: "1",
      VALUE: "9",
    });
    const keep = makeCsvRow({
      CURRENT_FLAG: "Y",
      NORMAL_CODE: "A",
      NORMAL_ID: "1",
      MONTH: "1",
      VALUE: "-4",
    });
    const map = parseClimateNormalsCsv(`${header}\n${skip1}\n${skip2}\n${keep}\n`);
    expect(map.get("1-1")).toBe(-4);
  });

  it("parses quoted fields containing commas", () => {
    const header = CSV_COLUMNS.join(",");
    const row = makeCsvRow({
      CURRENT_FLAG: "Y",
      NORMAL_CODE: "A",
      NORMAL_ID: "69",
      MONTH: "2",
      VALUE: "18.5",
      E_NORMAL_ELEMENT_NAME: '"Jours avec précipitations >= 0,2 mm"',
    });
    const map = parseClimateNormalsCsv(`${header}\n${row}\n`);
    expect(map.get("69-2")).toBe(18.5);
  });
});

describe("climate normals (MSC CSV API)", () => {
  beforeEach(() => moxios.install(axios));
  afterEach(() => moxios.uninstall(axios));

  it("fetches api.weather.gc.ca CSV and applies season + last-month normals", (done) => {
    const normals = initializeClimateNormals(true);
    normals.fetchClimateNormals(new Date(2023, 7, 7));

    moxios.wait(() => {
      const request = moxios.requests.mostRecent();
      expect(String(request?.url)).toContain("api.weather.gc.ca");
      expect(String(request?.url)).toContain("CLIMATE_IDENTIFIER=6158350");
      request
        ?.respondWith({ status: 200, response: SYNTHETIC_NORMALS_CSV })
        .then(() => {
          expect(normals.getNormalPrecipForCurrentSeason()).toStrictEqual({ amount: 46, unit: "mm" });
          expect(normals.getNormalsForLastMonth()).toStrictEqual({
            temperature: { min: 14, max: 24, mean: 20 },
            precip: { amount: 10 },
          });
          done();
        });
    });
  });

  // every month has 300 mm so the sums are easy to read: full season = 6 x 300, one elapsed day = 300 / days in month
  const EVERY_MONTH_300_CSV = [
    CSV_COLUMNS.join(","),
    ...Array.from({ length: 12 }, (_, i) =>
      makeCsvRow({ CURRENT_FLAG: "Y", NORMAL_CODE: "A", NORMAL_ID: "56", MONTH: String(i + 1), VALUE: "300" })
    ),
  ].join("\n");

  it.each([
    ["Oct 1 still covers the whole summer (Apr-Sep)", new Date(2026, 9, 1), 1800],
    ["Apr 1 still covers the whole winter (Oct-Mar)", new Date(2026, 3, 1), 1800],
    ["Oct 2 is the first winter day (1 elapsed day of Oct)", new Date(2026, 9, 2), 9.7],
    ["Apr 2 is the first summer day (1 elapsed day of Apr)", new Date(2026, 3, 2), 10],
  ])("seasonal normal changeover: %s (#854)", (_name, date, expected) => {
    const normals = initializeClimateNormals(true);
    normals.fetchClimateNormals(date);

    return new Promise<void>((resolve) => {
      moxios.wait(() => {
        moxios.requests
          .mostRecent()
          ?.respondWith({ status: 200, response: EVERY_MONTH_300_CSV })
          .then(() => {
            expect(normals.getNormalPrecipForCurrentSeason().amount).toBe(expected);
            resolve();
          });
      });
    });
  });
});
