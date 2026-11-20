jest.mock("fs");
import fs from "fs";
import { FS_NO_FILE_FOUND } from "consts/storage.consts";
import { initializeConfig } from "lib/config/config";
import {
  getActiveInfoScreens,
  getInfoScreenStatus,
  isValidInfoScreenDate,
  normalizeInfoScreenMessage,
  parseInfoScreens,
  validateInfoScreenMessage,
} from "lib/infoscreen";

const line32 = "x".repeat(32);

describe("info screen messages", () => {
  it("tidies up what was typed", () => {
    expect(normalizeInfoScreenMessage("\r\n\r\nHAPPY HOLIDAYS  \r\n\r\n\tBEST WISHES\r\n\r\n")).toBe(
      "HAPPY HOLIDAYS\n\n  BEST WISHES"
    );
  });

  it("accepts a message that fits the 8x32 display", () => {
    expect(validateInfoScreenMessage("HAPPY HOLIDAYS\n\nFROM\nENVIRONMENT CANADA\nAND SHAW.")).toBeUndefined();
    expect(validateInfoScreenMessage(Array(8).fill(line32).join("\n"))).toBeUndefined();
  });

  it("doesn't count the spaces around a centred line", () => {
    expect(validateInfoScreenMessage(`   ${line32}   `)).toBeUndefined();
  });

  it("rejects empty, non-text, too many lines and too wide lines", () => {
    expect(validateInfoScreenMessage("")).toMatch(/empty/);
    expect(validateInfoScreenMessage(" \n \n")).toMatch(/empty/);
    expect(validateInfoScreenMessage(undefined)).toMatch(/must be text/);
    expect(validateInfoScreenMessage(Array(9).fill("a").join("\n"))).toMatch(/9 lines.*8/);
    expect(validateInfoScreenMessage(`ok\n${line32}y`)).toMatch(/line 2 is 33 characters.*32/);
  });

  it("doesn't count the blank lines trimmed from the top/bottom against the 8 lines", () => {
    expect(validateInfoScreenMessage(`\n\n${Array(8).fill("a").join("\n")}\n\n`)).toBeUndefined();
  });
});

describe("info screen dates", () => {
  it("only accepts real yyyy-MM-dd dates", () => {
    expect(isValidInfoScreenDate("2026-12-25")).toBe(true);
    expect(isValidInfoScreenDate("2026-02-29")).toBe(false);
    expect(isValidInfoScreenDate("2026-02-31")).toBe(false);
    expect(isValidInfoScreenDate("2026-2-3")).toBe(false);
    expect(isValidInfoScreenDate("12/25/2026")).toBe(false);
    expect(isValidInfoScreenDate(20261225)).toBe(false);
  });

  it("works out if they should be showing, using the whole of the first and last day", () => {
    const entry = { id: "1", message: "hi", start: "2026-12-20", end: "2026-12-26" };
    expect(getInfoScreenStatus(entry, new Date(2026, 11, 19, 23, 59))).toBe("scheduled");
    expect(getInfoScreenStatus(entry, new Date(2026, 11, 20, 0, 0))).toBe("active");
    expect(getInfoScreenStatus(entry, new Date(2026, 11, 26, 23, 59))).toBe("active");
    expect(getInfoScreenStatus(entry, new Date(2026, 11, 27, 0, 0))).toBe("expired");
  });

  it("shows ones without dates all of the time, and with just one date from/until then", () => {
    const today = new Date(2026, 5, 1);
    expect(getInfoScreenStatus({ id: "1", message: "hi" }, today)).toBe("active");
    expect(getInfoScreenStatus({ id: "1", message: "hi", start: "2026-06-01" }, today)).toBe("active");
    expect(getInfoScreenStatus({ id: "1", message: "hi", end: "2026-05-31" }, today)).toBe("expired");
  });

  it("filters to the active ones", () => {
    const today = new Date(2026, 5, 15);
    const active = getActiveInfoScreens(
      [
        { id: "always", message: "a" },
        { id: "later", message: "b", start: "2026-07-01" },
        { id: "now", message: "c", start: "2026-06-01", end: "2026-06-30" },
        { id: "old", message: "d", end: "2026-06-14" },
      ],
      today
    );
    expect(active.map((screen) => screen.id)).toStrictEqual(["always", "now"]);
    expect(getActiveInfoScreens(undefined, today)).toStrictEqual([]);
  });
});

describe("parsing a list of info screens", () => {
  it("keeps valid ones, tidied up, and gives ids to those without", () => {
    const { entries, errors } = parseInfoScreens([
      { id: "abc", message: "HELLO  \n\n", start: "2026-12-01", end: "2026-12-31" },
      { message: "NO ID, NO DATES", start: "", end: "" },
    ]);

    expect(errors).toHaveLength(0);
    expect(entries[0]).toStrictEqual({ id: "abc", message: "HELLO", start: "2026-12-01", end: "2026-12-31" });
    expect(entries[1].message).toBe("NO ID, NO DATES");
    expect(entries[1].id).toEqual(expect.any(String));
    expect(entries[1]).not.toHaveProperty("start");
    expect(entries[1]).not.toHaveProperty("end");
  });

  it("gives a new id to one that reuses an id", () => {
    const { entries } = parseInfoScreens([
      { id: "same", message: "a" },
      { id: "same", message: "b" },
    ]);
    expect(entries[0].id).toBe("same");
    expect(entries[1].id).not.toBe("same");
  });

  it("reports what is wrong with each one that isn't valid", () => {
    const { entries, errors } = parseInfoScreens([
      { id: "good", message: "fine" },
      { id: "bad1", message: `${line32}y` },
      { id: "bad2", message: "x", start: "tomorrow" },
      { id: "bad3", message: "x", end: "2026-13-01" },
      { id: "bad4", message: "x", start: "2026-12-31", end: "2026-12-01" },
      null,
    ]);

    expect(entries.map((entry) => entry.id)).toStrictEqual(["good"]);
    expect(errors).toHaveLength(5);
    expect(errors[0]).toMatch(/^Info screen 2: line 1 is 33 characters/);
    expect(errors[1]).toMatch(/^Info screen 3: start must be/);
    expect(errors[2]).toMatch(/^Info screen 4: end must be/);
    expect(errors[3]).toMatch(/^Info screen 5: end is before start/);
    expect(errors[4]).toMatch(/^Info screen 6/);
  });

  it("rejects anything that isn't a list, and too many", () => {
    expect(parseInfoScreens({}).errors).toHaveLength(1);
    expect(parseInfoScreens(undefined).errors).toHaveLength(1);

    const { entries, errors } = parseInfoScreens(Array.from({ length: 51 }, (_, i) => ({ message: `m${i}` })));
    expect(errors[0]).toMatch(/only be 50/);
    expect(entries).toHaveLength(50);
  });
});

describe("info screens in the config", () => {
  const mockFiles = (files: Record<string, string>) =>
    jest.spyOn(fs, "readFileSync").mockImplementation(((path: string) => {
      const file = Object.keys(files).find((name) => path.endsWith(name));
      if (file) return files[file];
      throw Object.assign(new Error("not found"), { code: FS_NO_FILE_FOUND });
    }) as any);

  beforeEach(() => {
    jest.restoreAllMocks();
    (fs.writeFileSync as jest.Mock).mockReset();
  });

  it("has none when there's no file", () => {
    mockFiles({});
    const config = initializeConfig();
    expect(config.infoScreens).toStrictEqual([]);
    expect(config.activeInfoScreens).toStrictEqual([]);
  });

  it("has none when the file is corrupt", () => {
    mockFiles({ "info-screens.json": "{ not json" });
    expect(initializeConfig().infoScreens).toStrictEqual([]);
  });

  it("loads from file, leaving out any that don't fit the display", () => {
    mockFiles({
      "info-screens.json": JSON.stringify({
        infoScreens: [
          { id: "1", message: "HAPPY HOLIDAYS" },
          { id: "2", message: "x".repeat(40) },
        ],
      }),
    });

    const config = initializeConfig();
    expect(config.infoScreens).toStrictEqual([{ id: "1", message: "HAPPY HOLIDAYS" }]);
  });

  it("only gives the display the ones that are active today", () => {
    mockFiles({
      "info-screens.json": JSON.stringify({
        infoScreens: [
          { id: "now", message: "NOW" },
          { id: "expired", message: "OLD", end: "2000-01-01" },
          { id: "later", message: "SOON", start: "2999-01-01" },
        ],
      }),
    });

    const config = initializeConfig();
    expect(config.infoScreens).toHaveLength(3);
    expect(config.activeInfoScreens.map((screen) => screen.id)).toStrictEqual(["now"]);
  });

  it("is included for the config page but isn't written to the main config file", () => {
    mockFiles({ "info-screens.json": JSON.stringify({ infoScreens: [{ id: "1", message: "HI" }] }) });

    const config = initializeConfig();
    expect(config.config.infoScreens).toHaveLength(1);
    expect(config.configWithoutFlavour).not.toHaveProperty("infoScreens");
  });

  it("saves to its own file", () => {
    mockFiles({});
    const config = initializeConfig();

    config.setInfoScreens([{ id: "1", message: "HI", start: "2026-12-01" }]);

    expect(config.infoScreens).toHaveLength(1);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    const [path, contents] = (fs.writeFileSync as jest.Mock).mock.calls[0];
    expect(path).toBe("./cfg/info-screens.json");
    expect(JSON.parse(contents)).toStrictEqual({ infoScreens: [{ id: "1", message: "HI", start: "2026-12-01" }] });
  });

  it("keeps what it had when saving fails", () => {
    mockFiles({ "info-screens.json": JSON.stringify({ infoScreens: [{ id: "1", message: "KEEP ME" }] }) });
    const config = initializeConfig();

    (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("disk full");
    });

    expect(() => config.setInfoScreens([])).toThrow("disk full");
    expect(config.infoScreens).toStrictEqual([{ id: "1", message: "KEEP ME" }]);
  });
});
