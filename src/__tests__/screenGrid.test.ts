/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { DISPLAY_MAX_CHARACTERS_PER_LINE, DISPLAY_MAX_LINES } from "consts";
import {
  AlertScreen,
  AlmanacScreen,
  AQHIWarningScreen,
  ForecastScreen,
  InfoScreen,
  LastMonthScreen,
  NationalWeatherScreen,
  OutlookScreen,
  ProvinceTrackingScreen,
  StatsScreen,
  SunspotScreen,
  WindchillEffectScreen,
} from "../display/components/screens";

/**
 * Every screen has to fit the original hardware's 8 rows x 32 columns (DISPLAY_MAX_LINES x
 * DISPLAY_MAX_CHARACTERS_PER_LINE). These render each screen with worst-case data and measure what actually ends up on it.
 */

const BLOCK_ELEMENTS = new Set(["DIV", "OL", "UL", "LI", "P"]);

// turns the rendered dom into the rows of text you'd see on screen (block elements and <br> start a new row, and the
// screens are `white-space: pre` so line breaks inside of text are rows too)
function rowsOf(root: HTMLElement) {
  const rows: string[] = [];
  let current = "";
  const endRow = () => {
    if (current.length) rows.push(current);
    current = "";
  };

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      (node.textContent ?? "")
        .replace(/\u00a0/g, " ")
        .split("\n")
        .forEach((part, ix) => {
          if (ix > 0) {
            rows.push(current);
            current = "";
          }
          current += part;
        });
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const element = node as HTMLElement;
    if (element.tagName === "BR") {
      rows.push(current);
      current = "";
      return;
    }

    const isBlock = BLOCK_ELEMENTS.has(element.tagName);
    if (isBlock) endRow();
    element.childNodes.forEach(walk);
    if (isBlock) endRow();
  };

  walk(root);
  endRow();
  return rows.map((row) => row.replace(/\s+$/, ""));
}

const offenders: string[] = [];
const measured: Record<string, string[]> = {};

function check(name: string, rows: string[]) {
  measured[name] = rows;
  if (rows.length > DISPLAY_MAX_LINES) offenders.push(`${name}: ${rows.length} rows`);
  rows.forEach((row) => {
    if (row.length > DISPLAY_MAX_CHARACTERS_PER_LINE) offenders.push(`${name}: ${row.length} columns "${row}"`);
  });
}

function checkRender(name: string, element: any) {
  const { container } = render(element);
  check(name, rowsOf(container));
  cleanup();
}

const noop = () => {};

// local (no Z) so these aren't affected by the timezone the tests run in
const stationTime = (date: string, hour: number) => ({
  observedDateTime: `${date}T${String(hour).padStart(2, "0")}:00:00`,
  stationOffsetMinutesFromLocal: 0,
  timezone: "CST",
});

const record = (value: number, year?: number) => ({ value, unit: "C", year });
const forecastEntry = (period: string, text: string, conditions: string) => ({
  period,
  textSummary: text,
  abbreviatedTextSummary: text,
  temperature: { value: -35, class: "low" },
  conditions,
});

// the outlook starts two days after the observation, so the periods are built from the date
const weatherStation = (date: string, hour: number, observationID = "1"): any => {
  const day = new Date(`${date}T12:00:00`);
  const dayName = (ahead: number) => {
    const d = new Date(day);
    d.setDate(d.getDate() + ahead);
    return d.toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase();
  };
  const long = "Periods of snow or freezing rain changing to rain this afternoon. Local blowing snow. High plus 1.";

  return {
    stationID: "s0000193",
    city: "Winnipeg",
    observationID,
    stationTime: stationTime(date, hour),
    observed: {
      condition: "Freezing Rain",
      abbreviatedCondition: "Freezing Rain",
      temperature: { value: -35, units: "C" },
      pressure: { value: 101.3, units: "kPa", tendency: "falling", change: 1 },
      humidity: { value: 100, units: "%" },
      visibility: { value: 0.4, units: "km" },
      wind: { speed: { value: "99" }, gust: { value: 120 }, direction: "NNW" },
      windchill: 45,
    },
    forecast: [
      forecastEntry("today", long, "Snow"),
      forecastEntry("tonight", long, "Clear"),
      forecastEntry(dayName(1), long, "Snow"),
      forecastEntry(`${dayName(1)} night`, long, "Clear"),
      forecastEntry(dayName(2), long, "Periods of rain or snow"),
      forecastEntry(`${dayName(2)} night`, long, "Clear"),
      forecastEntry(dayName(3), long, "Chance of flurries"),
      forecastEntry(`${dayName(3)} night`, long, "Clear"),
      forecastEntry(dayName(4), long, "Sunny"),
      forecastEntry(`${dayName(4)} night`, long, "Clear"),
    ],
    almanac: {
      temperatures: {
        extremeMin: record(-44.4, 1966),
        extremeMax: record(36.1, 1988),
        normalMin: record(-17.2),
        normalMax: record(-7.9),
        lastYearMin: record(-30.1),
        lastYearMax: record(-12.2),
      },
    },
  };
};

const airQuality: any = {
  value: 11,
  textValue: "11-V High",
  showWarning: true,
  day: 28,
  month: 2,
  hour: 12,
  isPM: true,
};

const HOURS = [0, 9, 12, 13, 22];
const DATES = [
  "2026-01-28",
  "2026-02-28",
  "2026-03-28",
  "2026-04-28",
  "2026-05-28",
  "2026-06-28",
  "2026-07-28",
  "2026-08-28",
  "2026-09-28",
  "2026-10-28",
  "2026-11-28",
  "2026-12-28",
];

describe("every screen fits the 8x32 grid", () => {
  beforeEach(() => {
    offenders.length = 0;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("conditions, forecast, almanac and outlook (all hours/months)", async () => {
    for (const date of DATES) {
      jest.useFakeTimers().setSystemTime(new Date(`${date}T12:00:00`));

      for (const hour of HOURS) {
        const response = weatherStation(date, hour);
        const alert = { headline: "severe thunderstorm watch in effect", severity: 3 };

        checkRender(`almanac ${date} ${hour}h`, h(AlmanacScreen, { weatherStationResponse: response, airQuality }));
        checkRender(`outlook ${date} ${hour}h`, h(OutlookScreen, { weatherStationResponse: response }));

        // with and without an alert on the first page, then the two continuation pages
        for (const withAlert of [true, false]) {
          const { container } = render(
            h(ForecastScreen, {
              weatherStationResponse: response,
              airQuality,
              alert: withAlert ? (alert as any) : undefined,
              onComplete: noop,
            }),
          );
          check(`forecast page 1 ${date} ${hour}h alert=${withAlert}`, rowsOf(container));
          for (const page of [2, 3]) {
            await act(async () => {
              jest.advanceTimersByTime(14000);
            });
            check(`forecast page ${page} ${date} ${hour}h`, rowsOf(container));
          }
          cleanup();
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("national, sunspots, windchill, last month, stats and province tracking", () => {
    const national = Array.from({ length: 7 }, (_, i) => ({
      name: "Norway House",
      code: String(i),
      temperature: -35,
      condition: "x",
      abbreviatedCondition: "Freezing Rain",
    }));
    const sunspots = Array.from({ length: 7 }, (_, i) => ({
      name: "Brownsville",
      code: String(i),
      forecast: "x",
      abbreviatedForecast: "Pt Cloudy",
      highTemp: 88,
      lowTemp: 72,
    }));
    const province = (isOvernight: boolean) => ({
      isOvernight,
      yesterdayPrecipDate: "Sep 28",
      tracking: Array.from({ length: 6 }, (_, i) => ({
        station: { name: "Winnipeg Intl", code: String(i) },
        minTemp: -3,
        maxTemp: -1,
        displayTemp: -35,
        yesterdayPrecip: 12.3,
        yesterdayPrecipUnit: "mm",
      })),
    });
    const lastMonth = {
      actual: {
        averageHigh: -12.3,
        averageLow: -23.4,
        averageTemp: -17.9,
        totalPrecip: 112.3,
        warmestDay: { day: 22, value: 15.1 },
        coldestDay: { day: 3, value: -35.5 },
      },
      normal: { temperature: { min: -20.1, max: -9.9, mean: -15.0 }, precip: { amount: 120.1 } },
    };

    for (const date of DATES) {
      jest.useFakeTimers().setSystemTime(new Date(`${date}T12:00:00`));

      for (const hour of HOURS) {
        const time = stationTime(date, hour);

        checkRender(
          `national ${date} ${hour}h`,
          h(NationalWeatherScreen, {
            observations: national as any,
            area: "A",
            weatherStationTime: time,
            onComplete: noop,
          }),
        );
        checkRender(
          `sunspots ${date} ${hour}h`,
          h(SunspotScreen, { sunspots: sunspots as any, weatherStationTime: time, onComplete: noop }),
        );
        checkRender(
          `province overnight ${date} ${hour}h`,
          h(ProvinceTrackingScreen, { tracking: province(true) as any, weatherStationTime: time, onComplete: noop }),
        );
        checkRender(
          `province day ${date} ${hour}h`,
          h(ProvinceTrackingScreen, { tracking: province(false) as any, weatherStationTime: time, onComplete: noop }),
        );

        // sunrise/sunset with 1 and 2 digit hours, both of them can make the line too wide
        for (const [rise, set] of [
          [4, 21],
          [6, 22],
          [10, 23],
          [11, 20],
        ]) {
          checkRender(
            `stats ${date} ${hour}h rise ${rise} set ${set}`,
            h(StatsScreen, {
              city: "Thunder Bay",
              weatherStationTime: time,
              season: {
                season: { windchill: true, sunspot: false, winter: true },
                seasonPrecip: { amount: 376.6, normal: 123.4, snowfallSeasonCm: 199.9 },
              } as any,
              sunRiseSet: {
                rise: `${date}T${String(rise).padStart(2, "0")}:28:00`,
                set: `${date}T${set}:07:00`,
                timezone: "CST",
              } as any,
              hotColdSpots: {
                hotSpot: { name: "Chatham-Kent Longname Here", province: "ON", temperature: 21 },
                coldSpot: { name: "Eureka Longname Place Xx", province: "NU", temperature: -41 },
                lastUpdated: `${date}T13:00:00`,
              },
            }),
          );
        }
      }

      checkRender(`windchill ${date}`, h(WindchillEffectScreen, { onComplete: noop }));
      checkRender(
        `last month ${date}`,
        h(LastMonthScreen, { city: "Thunder Bay", lastMonth: lastMonth as any, onComplete: noop }),
      );
      checkRender(`aqhi ${date}`, h(AQHIWarningScreen, { city: "Winnipeg", airQuality, onComplete: noop }));
    }

    expect(offenders).toEqual([]);
  });

  it("info screens, including one that uses every column and row", () => {
    const widest = Array(DISPLAY_MAX_LINES).fill("x".repeat(DISPLAY_MAX_CHARACTERS_PER_LINE)).join("\n");
    const messages = ["HAPPY HOLIDAYS\n\nFROM\nENVIRONMENT CANADA\nAND SHAW.", "ODD\nEVEN\nODDER\nEVENER", widest];

    messages.forEach((message, ix) =>
      checkRender(`info ${ix}`, h(InfoScreen, { infoScreens: [{ id: "1", message }], onComplete: noop }))
    );

    expect(offenders).toEqual([]);
  });

  it("alerts and the severe thunderstorm watch explanation", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2026-06-28T12:00:00"));
    const alerts = [
      {
        headline: "severe thunderstorm watch in effect",
        description:
          "Conditions are favourable for the development of severe thunderstorms capable of producing large hail and damaging winds this afternoon and evening across southern Manitoba and northwestern Ontario including Winnipeg.",
        severity: 3,
      },
    ];

    const { container } = render(h(AlertScreen, { alerts: alerts as any, hasFetched: true, onComplete: noop }));
    await act(async () => {});
    check("alert", rowsOf(container));

    await act(async () => {
      jest.advanceTimersByTime(14000);
    });
    const explanation = rowsOf(container);
    check("severe thunderstorm explanation", explanation);

    // these are how the lines were originally broken by hand
    expect(explanation).toEqual([
      "a severe thunderstorm watch is",
      "an alert of possible thndrstrms",
      "large hail, intense lightning,",
      "locally heavy rain or damaging",
      "winds in and close to the watch",
      "area. persons in and near these",
      "areas should be on the lookout",
      "for severe weather conditions",
    ]);
    cleanup();

    // every alert line sits on a whole column, with an even gap or the odd one on the left (like the original)
    const [headline] = measured["alert"];
    expect(headline.length - headline.trimStart().length).toBe(Math.ceil((32 - headline.trim().length) / 2));

    expect(offenders).toEqual([]);
  });
});
