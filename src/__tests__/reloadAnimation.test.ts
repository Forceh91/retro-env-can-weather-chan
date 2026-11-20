/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { applyTypedRowTimings, getTypedRowTimings, seededRandom } from "lib/display";
import { RELOAD_FIRST_PAGE_DISPLAY_LENGTH, SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
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

describe("forecast screen page change timer", () => {
  const entry = (period: string) => ({
    period,
    textSummary: "",
    abbreviatedTextSummary: "Cloudy with sunny periods. High minus 3.",
    temperature: { value: -3, class: "high" },
    conditions: "Cloudy",
  });

  const response = (observationID: string): any => ({
    city: "Winnipeg",
    observationID,
    stationTime: { observedDateTime: "2026-02-18T13:00:00", stationOffsetMinutesFromLocal: 0, timezone: "CST" },
    observed: {
      abbreviatedCondition: "Cloudy",
      temperature: { value: -5, units: "C" },
      humidity: { value: 80, units: "%" },
      visibility: { value: 24, units: "km" },
      wind: { speed: { value: "10" }, gust: { value: 0 }, direction: "N" },
      pressure: { value: 101.3, units: "kPa", tendency: "rising", change: 1 },
    },
    forecast: ["today", "tonight", "thursday", "thursday night", "friday"].map(entry),
  });

  const PAGE_MS = SCREEN_DEFAULT_DISPLAY_LENGTH * 1000;
  const RELOAD_PAGE_MS = RELOAD_FIRST_PAGE_DISPLAY_LENGTH * 1000;
  const onComplete = jest.fn();
  const onContinuation = jest.fn();

  const forecast = (observationID: string, isReload: boolean) =>
    h(ForecastScreen, {
      weatherStationResponse: response(observationID),
      airQuality: {} as any,
      isReload,
      onComplete,
      onForecastContinuationEntered: onContinuation,
    } as any);

  const isOnContinuation = (container: HTMLElement) => container.textContent.includes("forecast cont..");
  const advance = (ms: number) =>
    act(() => {
      jest.advanceTimersByTime(ms);
    });

  beforeEach(() => {
    jest.useFakeTimers();
    onComplete.mockClear();
    onContinuation.mockClear();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it("moves to the continuation page, then completes, after the normal time", () => {
    const { container } = render(forecast("1", false));

    advance(PAGE_MS - 1);
    expect(isOnContinuation(container)).toBe(false);
    advance(1);
    expect(isOnContinuation(container)).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();

    advance(PAGE_MS);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("doesn't move to the continuation page on the old timer when new conditions arrive on the first page", () => {
    const { container, rerender } = render(forecast("1", false));
    advance(PAGE_MS - 4000);

    // the rotator flags the reload (and the animation starts) whilst the forecast is already on screen
    rerender(forecast("2", true));
    advance(5000);

    // this is past when the first page would have changed over without the new conditions
    expect(isOnContinuation(container)).toBe(false);
    expect(onContinuation).not.toHaveBeenCalled();

    // but it still moves on eventually, so the screen doesn't get stuck on the first page
    advance(PAGE_MS * 10);
    expect(isOnContinuation(container)).toBe(true);
  });

  it("restarts the timer for every new set of conditions that arrives whilst on the first page", () => {
    const { container, rerender } = render(forecast("1", false));
    advance(1000);

    // the reload is already flagged by the time the next conditions arrive, so only the observation changes
    rerender(forecast("2", true));
    advance(RELOAD_PAGE_MS - 1000);
    rerender(forecast("3", true));

    // the timer from the second set of conditions would have finished by now, the third's hasn't
    advance(2000);
    expect(isOnContinuation(container)).toBe(false);

    advance(RELOAD_PAGE_MS);
    expect(isOnContinuation(container)).toBe(true);
  });

  it("goes back to the first page when new conditions arrive on the continuation page, and times that too", () => {
    const { container, rerender } = render(forecast("1", false));
    advance(PAGE_MS);
    expect(isOnContinuation(container)).toBe(true);

    rerender(forecast("2", true));
    expect(isOnContinuation(container)).toBe(false);

    // the continuation page's timer must not complete the screen early
    advance(PAGE_MS);
    expect(onComplete).not.toHaveBeenCalled();
    expect(isOnContinuation(container)).toBe(false);

    advance(PAGE_MS * 10);
    expect(isOnContinuation(container)).toBe(true);
    advance(PAGE_MS);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("doesn't leave a timer running once it's gone", () => {
    const { unmount } = render(forecast("1", false));
    unmount();

    advance(PAGE_MS * 10);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
