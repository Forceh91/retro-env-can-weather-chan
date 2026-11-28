/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { cleanup, render } from "@testing-library/react";
import {
  AlmanacScreen,
  LastMonthScreen,
  OutlookScreen,
  ProvinceTrackingScreen,
  StatsScreen,
} from "../display/components/screens";

/**
 * Where things sit on the 32 column grid of the original channel. The columns below were measured off stills of the
 * original (0 based, the same grid the time/date footer sits on: "TIME" starts on column 2 and the date ends on 30).
 */

const BLOCK_ELEMENTS = new Set(["DIV", "OL", "UL", "LI", "P"]);

// the rows you'd see on screen, trailing spaces trimmed (leading ones kept, that's the point)
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

const rowsFor = (element: any) => {
  const { container } = render(element);
  const rows = rowsOf(container);
  cleanup();
  return rows;
};

const noop = () => {};
const DATE = "2026-03-26";
const stationTime = (hour: number) => ({
  observedDateTime: `${DATE}T${String(hour).padStart(2, "0")}:00:00`,
  stationOffsetMinutesFromLocal: 0,
  timezone: "CST",
});

describe("screens sit on the same columns as the original", () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(`${DATE}T12:00:00`));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("outlook: no dot padding on the days, one space before HIGH and conditions indented by 1 (screen 3)", () => {
    const day = (ahead: number) => {
      const d = new Date(`${DATE}T12:00:00`);
      d.setDate(d.getDate() + ahead);
      return d.toLocaleDateString("en-CA", { weekday: "long" }).toLowerCase();
    };
    const entry = (period: string, conditions: string) => ({
      period,
      textSummary: "",
      abbreviatedTextSummary: "",
      temperature: { value: 14, class: "low" },
      conditions,
    });
    const weatherStationResponse: any = {
      stationID: "s0000193",
      city: "Winnipeg",
      stationTime: stationTime(23),
      forecast: [
        entry("today", "Snow"),
        entry("tonight", "Clear"),
        entry(day(1), "Snow"),
        entry(`${day(1)} night`, "Clear"),
        entry(day(2), "Mainly sunny"),
        entry(`${day(2)} night`, "Clear"),
        entry(day(3), "Mainly sunny"),
        entry(`${day(3)} night`, "Clear"),
        entry(day(4), "Sunny"),
        entry(`${day(4)} night`, "Clear"),
      ],
      almanac: { temperatures: { normalMin: { value: -17 }, normalMax: { value: -8 } } },
    };

    const rows = rowsFor(h(OutlookScreen, { weatherStationResponse }));
    expect(rows[0]).toBe(" Outlook for southern manitoba");
    expect(rows[1]).toBe(`${day(2)}..Low 14. High 14.`);
    expect(rows[2]).toBe(" Mainly sunny.");
    expect(rows[3]).toBe(`${day(3)}..Low 14. High 14.`);
  });

  it("province tracking: headings end on 17, temperatures on 16 and the precip column starts on 20 (screen 5)", () => {
    const tracking = {
      isOvernight: true,
      yesterdayPrecipDate: "Jul 29",
      tracking: [
        ["Winnipeg", 10, 1.0],
        ["Thompson", 9, 8.2],
      ].map(([name, temp, precip]: any, ix) => ({
        station: { name, code: String(ix) },
        displayTemp: temp,
        yesterdayPrecip: precip,
        yesterdayPrecipUnit: "mm rain",
      })),
    };
    const rows = rowsFor(
      h(ProvinceTrackingScreen, { tracking: tracking as any, weatherStationTime: stationTime(9), onComplete: noop })
    );

    expect(rows[0].indexOf("Overnight")).toBe(8);
    expect(rows[0].indexOf("Overnight") + "Overnight".length).toBe(17);
    expect(rows[0].indexOf("24-Hr Precip")).toBe(20);
    expect(rows[1].indexOf("Low:")).toBe(13);
    expect(rows[1].indexOf("for")).toBe(20);

    rows.slice(2).forEach((row) => {
      // the temperature is the last thing before column 16 and the precip amount starts on 20
      expect(row.slice(10, 16).trim()).toMatch(/^-?\d+$/);
      expect(row[16]).toBe(" ");
      expect(row[20]).toMatch(/\d/);
    });
  });

  it("stats: headings centred, dotted lines end on the last column, hot/cold lines use all 32 columns (screen 10)", () => {
    const rows = rowsFor(
      h(StatsScreen, {
        city: "Winnipeg",
        weatherStationTime: stationTime(8),
        season: {
          season: { windchill: true, sunspot: false, winter: true },
          seasonPrecip: { amount: 100, normal: 99.6, snowfallSeasonCm: 143.7 },
        } as any,
        sunRiseSet: { rise: `${DATE}T06:17:00`, set: `${DATE}T18:52:00`, timezone: "CST" } as any,
        hotColdSpots: {
          hotSpot: { name: "Ste. Clothide", province: "PQ", temperature: 19 },
          coldSpot: { name: "Eureka", province: "NWT", temperature: -42 },
          lastUpdated: `${DATE}T13:00:00`,
        },
      })
    );

    expect(rows[0]).toBe(" Winnipeg statistics - March 26");
    expect(rows[2].indexOf("Total snowfall since")).toBe(6);
    expect(rows[3].indexOf("October")).toBe(2);
    expect(rows[3].length).toBe(32);
    expect(rows[4].indexOf("Normal")).toBe(2);
    expect(rows[4].length).toBe(32);

    [rows[6], rows[7]].forEach((row) => {
      expect(row.length).toBe(32);
      expect(row.indexOf(row.trim())).toBe(0);
    });
    expect(rows[6].endsWith("..19")).toBe(true);
    expect(rows[7].endsWith("-42")).toBe(true);
  });

  it("last month: city on 2, THIS YEAR on 14, NORMAL on 25 and the values end on 21 and 30 (screen 12)", () => {
    const lastMonth: any = {
      actual: {
        averageHigh: -10,
        averageLow: -21.4,
        averageTemp: -15.7,
        totalPrecip: 58.4,
        warmestDay: { day: 27, value: 2.2 },
        coldestDay: { day: 10, value: -35.7 },
      },
      normal: { temperature: { min: -24.2, max: -14.3, mean: -19.2 }, precip: { amount: 23.7 } },
    };
    const rows = rowsFor(h(LastMonthScreen, { city: "Winnipeg", lastMonth, onComplete: noop }));

    expect(rows[0].indexOf("Weather")).toBe(1);
    expect(rows[1].indexOf("Winnipeg")).toBe(2);
    expect(rows[1].indexOf("This Year")).toBe(14);
    expect(rows[1].indexOf("Normal")).toBe(25);
    expect(rows[2].indexOf("-10.0") + "-10.0".length).toBe(21);
    expect(rows[2].indexOf("-14.3") + "-14.3".length).toBe(30);
    // warmest/coldest were already right
    expect(rows[6].indexOf("+2.2")).toBe(15);
    expect(rows[7].indexOf("-35.7")).toBe(14);
  });

  it("almanac: pressure leaves room for the second decimal, KPA on 19 and the tendency on 23 (screen 4)", () => {
    const weatherStationResponse: any = {
      city: "Winnipeg",
      stationTime: stationTime(23),
      observed: {
        abbreviatedCondition: "Cloudy",
        temperature: { value: -10, units: "C" },
        pressure: { value: 100.17, units: "kPa", tendency: "falling" },
        humidity: { value: 89, units: "%" },
        visibility: { value: 19, units: "km" },
        wind: { speed: { value: "15" }, direction: "S" },
        windchill: 1350,
      },
      almanac: { temperatures: {} },
    };
    const row = rowsFor(h(AlmanacScreen, { weatherStationResponse, airQuality: undefined }))[4];

    expect(row.indexOf("Pressure")).toBe(3);
    expect(row.indexOf("100.2")).toBe(12);
    expect(row.indexOf("kPa")).toBe(19);
    expect(row.indexOf("falling")).toBe(23);
    expect(row.length).toBe(30);
  });

  it("stats: hot/cold spot lines are the same full width and names are only cut when needed (the November 22 data)", () => {
    const rows = rowsFor(
      h(StatsScreen, {
        city: "Winnipeg",
        weatherStationTime: stationTime(8),
        season: {
          season: { windchill: true, sunspot: false, winter: true },
          seasonPrecip: { amount: 35.7, normal: 55, snowfallSeasonCm: 0 },
        } as any,
        sunRiseSet: { rise: `${DATE}T08:52:00`, set: `${DATE}T17:37:00`, timezone: "CST" } as any,
        hotColdSpots: {
          hotSpot: { name: "St. Catharines / Niagara District Airport", province: "ON", temperature: 19 },
          coldSpot: { name: "Key Lake", province: "SK", temperature: -32 },
          lastUpdated: `${DATE}T13:00:00`,
        },
      })
    );
    const [hot, cold] = rows.slice(-2);

    expect(hot).toBe("St. Catharines, ON ...........19");
    expect(cold).toBe("Key Lake, SK ................-32");
    expect(hot.length).toBe(32);
    expect(cold.length).toBe(32);
  });
});
