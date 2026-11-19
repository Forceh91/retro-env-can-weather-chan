/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { cleanup, render } from "@testing-library/react";
import { applyTypedRowTimings, getTypedRowTimings, seededRandom } from "lib/display";
import { ForecastScreen } from "../display/components/screens";

describe("getTypedRowTimings", () => {
  const steady = { speedJitter: 0 };

  it("types characters one after another at the given speed, after the screen has been cleared", () => {
    // 30 cps, blank for 400ms, 100ms between rows
    const [first, second, third] = getTypedRowTimings([30, 15, 60], {
      ...steady,
      charsPerSecond: 30,
      clearScreenMs: 400,
      rowPauseMs: 100,
    });

    expect(first).toStrictEqual({ chars: 30, delaySeconds: 0.4, durationSeconds: 1 });
    expect(second).toStrictEqual({ chars: 15, delaySeconds: 0.4 + 1 + 0.1, durationSeconds: 0.5 });
    expect(third).toStrictEqual({ chars: 60, delaySeconds: 0.4 + 1 + 0.1 + 0.5 + 0.1, durationSeconds: 2 });
  });

  it("skips empty rows without spending any time on them", () => {
    const timings = getTypedRowTimings([30, 0, 30], {
      ...steady,
      charsPerSecond: 30,
      clearScreenMs: 0,
      rowPauseMs: 100,
    });

    expect(timings[1]).toBeNull();
    expect(timings[2].delaySeconds).toBeCloseTo(1.1, 5);
  });

  it("uses the original hardware speed when there's no jitter", () => {
    expect(getTypedRowTimings([80], steady)[0].durationSeconds).toBe(1);
  });

  it("gives each row its own speed, between full speed and the jitter's worth slower", () => {
    // random() of 0 is a row at full speed, and just under 1 is the slowest it can get
    const [fast, slowest, middle] = (() => {
      const values = [0, 0.999999, 0.5];
      return getTypedRowTimings([30, 30, 30], { charsPerSecond: 30, speedJitter: 0.4, random: () => values.shift() });
    })();

    expect(fast.durationSeconds).toBeCloseTo(1, 5); // 30 cps
    expect(slowest.durationSeconds).toBeCloseTo(30 / (30 * 0.6), 3); // 18 cps
    expect(middle.durationSeconds).toBeCloseTo(30 / (30 * 0.8), 5); // 24 cps
  });

  it("never gets faster than the line speed or slower than the jitter allows, whatever the random numbers are", () => {
    const rows = Array.from({ length: 200 }, () => 30);
    const timings = getTypedRowTimings(rows, { charsPerSecond: 30, speedJitter: 0.4, random: seededRandom("a") });

    timings.forEach((timing) => {
      expect(timing.durationSeconds).toBeGreaterThanOrEqual(1);
      expect(timing.durationSeconds).toBeLessThanOrEqual(30 / (30 * 0.6) + 1e-9);
    });
    expect(new Set(timings.map((timing) => timing.durationSeconds)).size).toBeGreaterThan(50);
  });
});

describe("seededRandom", () => {
  it("gives the same numbers for the same seed, different ones for another, always between 0 and 1", () => {
    const first = Array.from({ length: 5 }, seededRandom("obs-1"));
    const again = Array.from({ length: 5 }, seededRandom("obs-1"));
    const other = Array.from({ length: 5 }, seededRandom("obs-2"));

    expect(first).toStrictEqual(again);
    expect(first).not.toStrictEqual(other);
    [...first, ...other].forEach((n) => {
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    });
  });
});

describe("applyTypedRowTimings", () => {
  const rowsOf = (html: string) => {
    document.body.innerHTML = `<div id="screen">${html}</div>`;
    const screen = document.getElementById("screen");
    applyTypedRowTimings(screen);
    return Array.from(screen.querySelectorAll<HTMLElement>(".grid-row"));
  };

  it("measures what is on each row, however it was put together, and ignores trailing spaces", () => {
    const [row] = rowsOf(`<div class="grid-row"><span>Temp&nbsp;</span><span>-35 C</span>      </div>`);

    expect(row.style.getPropertyValue("--type-chars")).toBe("10");
  });

  it("starts each row after the last one finished and leaves empty rows alone", () => {
    const [a, empty, b] = rowsOf(
      `<div class="grid-row">${"a".repeat(30)}</div><div class="grid-row"></div><div class="grid-row">${"b".repeat(15)}</div>`,
    );
    const seconds = (row: HTMLElement, name: string) => parseFloat(row.style.getPropertyValue(name));

    expect(seconds(a, "--type-delay")).toBe(0.4);
    expect(empty.style.getPropertyValue("--type-chars")).toBe("");
    // 10ms between rows
    expect(seconds(b, "--type-delay")).toBeCloseTo(
      seconds(a, "--type-delay") + seconds(a, "--type-duration") + 0.01,
      2,
    );
  });

  it("varies the speed with the seed, and a given seed always gives the same timings", () => {
    const html = Array.from({ length: 6 }, () => `<div class="grid-row">${"x".repeat(30)}</div>`).join("");
    const durations = (seed: string) => {
      document.body.innerHTML = `<div id="screen">${html}</div>`;
      const screen = document.getElementById("screen");
      applyTypedRowTimings(screen, seed);
      return Array.from(screen.querySelectorAll<HTMLElement>(".grid-row")).map((row) =>
        row.style.getPropertyValue("--type-duration"),
      );
    };

    expect(durations("1")).toStrictEqual(durations("1"));
    expect(durations("1")).not.toStrictEqual(durations("2"));
    expect(new Set(durations("1")).size).toBeGreaterThan(1);
  });

  it("doesn't mind there being no screen", () => {
    expect(() => applyTypedRowTimings(null)).not.toThrow();
  });
});

describe("forecast screen reload", () => {
  const response: any = {
    city: "Winnipeg",
    observationID: "1",
    stationTime: { observedDateTime: "2026-02-18T13:00:00", stationOffsetMinutesFromLocal: 0, timezone: "CST" },
    observed: {
      abbreviatedCondition: "Cloudy",
      temperature: { value: -5, units: "C" },
      humidity: { value: 80, units: "%" },
      visibility: { value: 24, units: "km" },
      wind: { speed: { value: "10" }, gust: { value: 0 }, direction: "N" },
      pressure: { value: 101.3, units: "kPa", tendency: "rising", change: 1 },
    },
    forecast: [
      {
        period: "today",
        textSummary: "",
        abbreviatedTextSummary: "Cloudy with sunny periods. High minus 3.",
        temperature: { value: -3, class: "high" },
        conditions: "Cloudy",
      },
    ],
  };

  const typedRows = (isReload: boolean) => {
    const { container } = render(
      h(ForecastScreen, {
        weatherStationResponse: response,
        airQuality: {} as any,
        isReload,
        onComplete: () => {},
      } as any),
    );
    const rows = Array.from(container.querySelectorAll<HTMLElement>(".grid-row"));
    return { container, rows };
  };

  afterEach(cleanup);

  it("gives every row with text a start time that is later than the one before it", () => {
    const { container, rows } = typedRows(true);
    const timed = rows.filter((row) => row.style.getPropertyValue("--type-chars"));
    const delays = timed.map((row) => parseFloat(row.style.getPropertyValue("--type-delay")));

    expect(container.querySelector("#forecast_screen").classList.contains("has-reloaded")).toBe(true);
    expect(timed.length).toBeGreaterThanOrEqual(5);
    expect(delays[0]).toBe(0.4);
    expect([...delays].sort((x, y) => x - y)).toStrictEqual(delays);
    expect(new Set(delays).size).toBe(delays.length);
  });

  it("doesn't time anything when it isn't a reload", () => {
    const { container, rows } = typedRows(false);

    expect(container.querySelector("#forecast_screen").classList.contains("has-reloaded")).toBe(false);
    expect(rows.every((row) => !row.style.getPropertyValue("--type-chars"))).toBe(true);
  });
});
