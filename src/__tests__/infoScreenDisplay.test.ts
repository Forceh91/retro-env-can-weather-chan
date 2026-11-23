/**
 * @jest-environment jsdom
 */
import { createElement as h } from "react";
import { act, cleanup, render } from "@testing-library/react";
import { SCREEN_DEFAULT_DISPLAY_LENGTH } from "consts";
import { InfoScreen } from "../display/components/screens";

const PAGE_MS = SCREEN_DEFAULT_DISPLAY_LENGTH * 1000;
const text = (container: HTMLElement) => container.querySelector("#info_screen")?.textContent;

describe("info screen", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it("centres every line on the grid, keeping blank lines", () => {
    const { container } = render(
      h(InfoScreen, {
        infoScreens: [{ id: "1", message: "HAPPY HOLIDAYS\n\nFROM\nENVIRONMENT CANADA\nAND SHAW." }],
        onComplete: jest.fn(),
      })
    );

    expect(text(container)?.split("\n")).toStrictEqual([
      `${" ".repeat(9)}HAPPY HOLIDAYS`,
      "",
      `${" ".repeat(14)}FROM`,
      `${" ".repeat(7)}ENVIRONMENT CANADA`,
      `${" ".repeat(12)}AND SHAW.`,
    ]);
  });

  it("shows each info screen for a page then completes after the last", () => {
    const onComplete = jest.fn();
    const { container } = render(
      h(InfoScreen, {
        infoScreens: [
          { id: "1", message: "FIRST" },
          { id: "2", message: "SECOND" },
        ],
        onComplete,
      })
    );

    expect(text(container)).toContain("FIRST");
    act(() => {
      jest.advanceTimersByTime(PAGE_MS - 1);
    });
    expect(text(container)).toContain("FIRST");
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(text(container)).toContain("SECOND");
    expect(onComplete).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(PAGE_MS);
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("moves straight on when there's nothing to show", () => {
    const onComplete = jest.fn();
    const { container } = render(h(InfoScreen, { infoScreens: [], onComplete }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(container.querySelector("#info_screen")).toBeNull();

    const missing = jest.fn();
    render(h(InfoScreen, { infoScreens: undefined, onComplete: missing }));
    expect(missing).toHaveBeenCalledTimes(1);
  });

  it("isn't changed by a refetch whilst it's showing", () => {
    const { container, rerender } = render(
      h(InfoScreen, { infoScreens: [{ id: "1", message: "BEFORE" }], onComplete: jest.fn() })
    );

    rerender(h(InfoScreen, { infoScreens: [{ id: "1", message: "AFTER" }], onComplete: jest.fn() }));
    expect(text(container)).toContain("BEFORE");
  });

  it("fits a message that uses the whole 8x32 display", () => {
    const message = Array(8).fill("x".repeat(32)).join("\n");
    const { container } = render(h(InfoScreen, { infoScreens: [{ id: "1", message }], onComplete: jest.fn() }));
    expect(text(container)).toBe(message);
  });
});
