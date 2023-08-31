import { FlavourLoader } from "lib/flavour/flavour";
import testFlavour from "./testdata/flavours/test_flavour.json";
import fs from "fs";
import { parseISO } from "date-fns";
import { FLAVOUR_DEFAULT } from "consts/flavour.consts";
import { SCREEN_MIN_DISPLAY_LENGTH } from "consts/screens.consts";
import { Screens } from "consts/screens.consts";
import { FS_NO_FILE_FOUND } from "consts/storage.consts";
import { isAutomaticScreen } from "lib/flavour/utils";
jest.mock("fs");

describe("Flavour loading", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("loads a flavour from a file correctly", () => {
    jest.spyOn(fs, "readFileSync").mockReturnValueOnce(JSON.stringify(testFlavour));

    const flavour = new FlavourLoader("test_flavour");
    expect(flavour.name).toBe(testFlavour.name);
    expect(flavour.created).toStrictEqual(parseISO(testFlavour.created));
    expect(flavour.modified).toStrictEqual(parseISO(testFlavour.modified));
    expect(flavour.screens).toHaveLength(testFlavour.screens.length);
  });

  it("ignores invalid screens in the config", () => {
    const spy = jest.spyOn(fs, "readFileSync");
    spy.mockReturnValueOnce(
      JSON.stringify({
        ...testFlavour,
        screens: [
          ...testFlavour.screens,
          { id: 22, duration: 4 },
          { id: 22, duration: "not a number lol" },
          { id: 0, duration: "not a number lol" },
        ],
      })
    );

    const flavour = new FlavourLoader("test_flavour");
    expect(flavour.name).toBe(testFlavour.name);
    expect(flavour.created).toStrictEqual(parseISO(testFlavour.created));
    expect(flavour.modified).toStrictEqual(parseISO(testFlavour.modified));
    expect(flavour.screens).toHaveLength(testFlavour.screens.length);
  });

  it("makes sure the duration of a screen is the min value", () => {
    const screens = [...testFlavour.screens, { id: 5, duration: 4 }];
    const spy = jest.spyOn(fs, "readFileSync");
    spy.mockReturnValueOnce(
      JSON.stringify({
        ...testFlavour,
        screens,
      })
    );

    const flavour = new FlavourLoader("test_flavour");
    expect(flavour.name).toBe(testFlavour.name);
    expect(flavour.created).toStrictEqual(parseISO(testFlavour.created));
    expect(flavour.modified).toStrictEqual(parseISO(testFlavour.modified));
    expect(flavour.screens).toHaveLength(screens.length);
    expect(flavour.screens[screens.length - 1].duration).toBe(SCREEN_MIN_DISPLAY_LENGTH);
  });

  it("handles the flavour json being corrupted", () => {
    const spy = jest.spyOn(fs, "readFileSync");
    spy.mockReturnValueOnce("this is not json");

    const flavour = new FlavourLoader("test_flavour");
    expect(flavour.name).toStrictEqual(FLAVOUR_DEFAULT.name);
    expect(flavour.screens).toHaveLength(FLAVOUR_DEFAULT.screens.length);
  });

  it("handles no flavour file existing", () => {
    const spy = jest.spyOn(fs, "readFileSync");
    spy.mockImplementationOnce(() => {
      throw { code: FS_NO_FILE_FOUND };
    });

    const flavour = new FlavourLoader("test_flavour");
    expect(flavour.name).toStrictEqual(FLAVOUR_DEFAULT.name);
    expect(flavour.screens).toHaveLength(FLAVOUR_DEFAULT.screens.length);
  });
});

describe("Flavour utils", () => {
  it("detectes auto-duration screens correctly", () => {
    const autoDurationScreens = [Screens.ALERTS, Screens.FORECAST, Screens.WINDCHILL];
    const manualDurationScreens = [Screens.ALMANAC, Screens.CANADA_TEMP_CONDITIONS_EAST, Screens.LAST_MONTH_STATS];

    autoDurationScreens.forEach((autoScreen) => expect(isAutomaticScreen(autoScreen)).toBeTruthy());
    manualDurationScreens.forEach((manualScreen) => expect(isAutomaticScreen(manualScreen)).toBeFalsy());
  });
});
