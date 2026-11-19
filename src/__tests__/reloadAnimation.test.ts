/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { cleanup, render } from "@testing-library/react";
import { applyTypedRowTimings, getTypedRowTimings } from "lib/display";
import { ForecastScreen } from "../display/components/screens";

describe("getTypedRowTimings", () => {
  it("types characters one after another at the given speed, after the screen has been cleared", () => {
    // 30 cps, blank for 400ms, 100ms between rows
    const [first, second, third] = getTypedRowTimings([30, 15, 60], 30, 400, 100);

    expect(first).toStrictEqual({ chars: 30, delaySeconds: 0.4, durationSeconds: 1 });
    expect(second).toStrictEqual({ chars: 15, delaySeconds: 0.4 + 1 + 0.1, durationSeconds: 0.5 });
    expect(third).toStrictEqual({ chars: 60, delaySeconds: 0.4 + 1 + 0.1 + 0.5 + 0.1, durationSeconds: 2 });
  });

  it("skips empty rows without spending any time on them", () => {
    const timings = getTypedRowTimings([30, 0, 30], 30, 0, 100);

    expect(timings[1]).toBeNull();
    expect(timings[2].delaySeconds).toBeCloseTo(1.1, 5);
  });

  it("uses the original hardware speed (300bps = 30 characters a second) by default", () => {
    expect(getTypedRowTimings([30])[0].durationSeconds).toBe(1);
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

    expect(a.style.getPropertyValue("--type-delay")).toBe("0.4s");
    expect(a.style.getPropertyValue("--type-duration")).toBe("1s");
    expect(empty.style.getPropertyValue("--type-chars")).toBe("");
    expect(b.style.getPropertyValue("--type-delay")).toBe("1.52s");
    expect(b.style.getPropertyValue("--type-duration")).toBe("0.5s");
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
