/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { applyTypedRowTimings, getTypedRowSteps, TYPED_ROW_MAX_STEPS, TypedRowKind } from "lib/display";
import {
  RELOAD_CLEAR_SCREEN_FRAMES,
  RELOAD_FIRST_PAGE_DISPLAY_LENGTH,
  RELOAD_FRAME_MS,
  SCREEN_DEFAULT_DISPLAY_LENGTH,
} from "consts";
import { ForecastScreen } from "../display/components/screens";

// frames are counted from when the screen was cleared, which is how the recording of the original was numbered
const seconds = (frame: number) => (frame * RELOAD_FRAME_MS) / 1000;
const rows = (kind: TypedRowKind, ...chars: number[]) => chars.map((length) => ({ chars: length, kind }));
const asFrames = (steps: { chars: number; atSeconds: number }[]) =>
  steps.map(({ chars, atSeconds }) => [chars, Math.round((atSeconds * 1000) / RELOAD_FRAME_MS)]);

describe("getTypedRowSteps", () => {
  it("waits for the screen to have been blank for as long as the original before the first burst", () => {
    const [[first]] = getTypedRowSteps(rows("conditions", 31));

    expect(RELOAD_CLEAR_SCREEN_FRAMES).toBe(26);
    expect(first.atSeconds).toBeCloseTo(seconds(26), 5);
  });

  it("sends conditions in bursts of 8 characters, in pairs a frame apart", () => {
    const [first] = getTypedRowSteps(rows("conditions", 31));

    // WINNIPEG / 11 PM / CST DEC / 31/98 arrived on frames 26, 27, 29 and 30 of the recording
    expect(asFrames(first)).toStrictEqual([
      [9, 26],
      [17, 27],
      [25, 29],
      [31, 30],
    ]);
  });

  it("carries on from the row above, so a row starts with a single character from the last burst of the one before", () => {
    const [, second] = getTypedRowSteps(rows("conditions", 31, 32));

    expect(asFrames(second)).toStrictEqual([
      [1, 30],
      [9, 32],
      [17, 33],
      [25, 35],
      [32, 36],
    ]);
  });

  it("slows the pairs of bursts from every 3 frames to every 4", () => {
    const steps = getTypedRowSteps(rows("conditions", 32, 32, 32, 32)).flat();
    const frames = [...new Set(asFrames(steps).map(([, frame]) => frame))].sort((a, b) => a - b);

    expect(frames).toStrictEqual([26, 27, 29, 30, 32, 33, 35, 36, 39, 40, 43, 44, 47, 48, 51, 52]);
  });

  it("sends the forecast in its own columns, and skips the first burst of every other row", () => {
    const [, , , , ...forecast] = getTypedRowSteps([
      ...rows("conditions", 31, 32, 28, 30),
      ...rows("forecast", 30, 20, 27, 27),
    ]);

    // FORECAST FOR TONIGHT..LOW -32. / MAINLY CLEAR. / WIND LIGHT AND VARIABLE. / WINDCHILL AT TIMES 1800.
    expect(forecast.map(asFrames)).toStrictEqual([
      [
        [4, 55],
        [16, 56],
        [20, 59],
        [30, 60],
      ],
      [
        [16, 64],
        [20, 67],
      ],
      [
        [4, 71],
        [16, 72],
        [20, 75],
        [27, 76],
      ],
      [
        [16, 80],
        [20, 83],
        [27, 84],
      ],
    ]);
  });

  it("matches the recording for the rest of the conditions", () => {
    const conditions = getTypedRowSteps([...rows("conditions", 31, 32, 28, 30), ...rows("forecast", 30)]).slice(2, 4);

    expect(conditions.map(asFrames)).toStrictEqual([
      [
        [1, 36],
        [9, 39],
        [17, 40],
        [25, 43],
        [28, 44],
      ],
      [
        [1, 44],
        [9, 47],
        [17, 48],
        [25, 51],
        [30, 52],
      ],
    ]);
  });

  it("finishes a short row in an earlier burst without holding up the rows after it", () => {
    const withShortRow = getTypedRowSteps(rows("forecast", 30, 5, 27));
    const withFullRow = getTypedRowSteps(rows("forecast", 30, 32, 27));

    expect(withShortRow[1]).toHaveLength(1);
    expect(withShortRow[2]).toStrictEqual(withFullRow[2]);
  });

  it("keeps the place of an empty row in what is being sent, but doesn't give it anything to reveal", () => {
    const [, empty, after] = getTypedRowSteps(rows("conditions", 30, 0, 30));
    const [, , expected] = getTypedRowSteps(rows("conditions", 30, 32, 30));

    expect(empty).toStrictEqual([]);
    expect(after).toStrictEqual(expected);
  });

  it("is done sooner when the forecast is shorter, as there is less of it to send", () => {
    const lastBurst = (lines: number) => {
      const steps = getTypedRowSteps([
        ...rows("conditions", 31, 32, 28, 30),
        ...rows("forecast", ...Array(lines).fill(30)),
      ]);
      return Math.max(...steps.flat().map(({ atSeconds }) => atSeconds));
    };

    expect(lastBurst(1)).toBeLessThan(lastBurst(2));
    expect(lastBurst(2)).toBeLessThan(lastBurst(4));
    expect(lastBurst(4)).toBeCloseTo(seconds(84), 5);
  });

  it("never shows more than a row's worth, and never needs more bursts than the css has room for", () => {
    const all = getTypedRowSteps([...rows("conditions", 99, 99, 99, 99, 99), ...rows("forecast", 99, 99, 99, 99)]);

    all.forEach((steps) => {
      expect(steps.length).toBeLessThanOrEqual(TYPED_ROW_MAX_STEPS);
      expect(steps[steps.length - 1].chars).toBe(32);
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
  const get = (row: HTMLElement, name: string) => row.style.getPropertyValue(name);

  it("measures what is on each row, however it was put together, and ignores trailing spaces", () => {
    const [row] = rowsOf(`<div class="grid-row"><span>Temp&nbsp;</span><span>-35 C</span>      </div>`);

    // 10 characters, the first burst has 9 in it and the second finishes the row
    expect(get(row, "--type-w0")).toBe("9");
    expect(get(row, "--type-w1")).toBe("10");
    expect(get(row, `--type-w${TYPED_ROW_MAX_STEPS - 1}`)).toBe("10");
    expect(get(row, "--type-t0")).toBe(`${Math.round(seconds(26) * 1000) / 1000}s`);
  });

  it("gives every burst a width and a time, repeating the last one for rows that need less", () => {
    const [row] = rowsOf(`<div class="grid-row">${"a".repeat(31)}</div>`);

    expect(Array.from({ length: TYPED_ROW_MAX_STEPS }, (_, ix) => get(row, `--type-w${ix}`))).toStrictEqual([
      "9",
      "17",
      "25",
      "31",
      "31",
    ]);
    expect(get(row, "--type-t4")).toBe(get(row, "--type-t3"));
  });

  it("treats rows in the forecast differently to the rest", () => {
    const [conditions, forecast] = rowsOf(
      `<div id="conditions"><div class="grid-row">${"a".repeat(30)}</div></div><div class="forecast"><div class="grid-row">${"b".repeat(30)}</div></div>`
    );

    expect(get(conditions, "--type-w0")).toBe("9");
    expect(get(forecast, "--type-w0")).toBe("4");
  });

  it("leaves empty rows alone", () => {
    const [empty] = rowsOf(`<div class="grid-row"></div>`);

    expect(get(empty, "--type-w0")).toBe("");
    expect(get(empty, "--type-t0")).toBe("");
  });

  it("doesn't mind there being no screen", () => {
    expect(() => applyTypedRowTimings(null)).not.toThrow();
  });
});

describe("forecast screen reload", () => {
  const response: any = {
    city: "Winnipeg",
    observationID: "1",
    stationTime: {
      observedDateTime: "2026-02-18T13:00:00",
      stationOffsetMinutesFromLocal: 0,
      timezone: "CST",
    },
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
      } as any)
    );
    const rows = Array.from(container.querySelectorAll<HTMLElement>(".grid-row"));
    return { container, rows };
  };

  afterEach(cleanup);

  it("starts every row after the clear, and never before the row above it", () => {
    const { container, rows } = typedRows(true);
    const timed = rows.filter((row) => row.style.getPropertyValue("--type-w0"));
    const starts = timed.map((row) => parseFloat(row.style.getPropertyValue("--type-t0")));

    expect(container.querySelector("#forecast_screen").classList.contains("has-reloaded")).toBe(true);
    expect(timed.length).toBeGreaterThanOrEqual(5);
    expect(starts[0]).toBeCloseTo(seconds(26), 2);
    expect([...starts].sort((x, y) => x - y)).toStrictEqual(starts);
  });

  it("doesn't time anything when it isn't a reload", () => {
    const { container, rows } = typedRows(false);

    expect(container.querySelector("#forecast_screen").classList.contains("has-reloaded")).toBe(false);
    expect(rows.every((row) => !row.style.getPropertyValue("--type-w0"))).toBe(true);
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
    stationTime: {
      observedDateTime: "2026-02-18T13:00:00",
      stationOffsetMinutesFromLocal: 0,
      timezone: "CST",
    },
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
