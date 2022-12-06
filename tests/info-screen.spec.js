import { addDays, format, subDays } from "date-fns";
import * as configInfoScreens from "../config/info-screens";

const longMessage =
  "a really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\n";

const today = new Date();
const formattedToday = format(today, "yyyy-MM-dd");
const formattedYesterday = format(subDays(today, 1), "yyyy-MM-dd");
const formattedTomorrow = format(addDays(today, 1), "yyyy-MM-dd");

describe("info-screens.js", () => {
  beforeEach(() => configInfoScreens.getInfoScreens().splice(0));

  test("createInfoScreen: checks message length is valid", (done) => {
    expect(configInfoScreens.createInfoScreen()).toBeFalsy();
    expect(configInfoScreens.createInfoScreen(longMessage)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("a short message", formattedToday, null, true)).toBeTruthy();
    done();
  });

  test("createInfoScreen: makes sure end or isInfinite is set", (done) => {
    expect(configInfoScreens.createInfoScreen("test", formattedToday)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, "2022-12-14")).toBeTruthy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
    done();
  });

  test("createInfoScreen: makes sure start date is set correctly", (done) => {
    expect(configInfoScreens.createInfoScreen("test", null)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", "2022-12-32", null, true)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
    done();
  });

  test("createInfoScreen: make sure end date is set correctly", (done) => {
    expect(configInfoScreens.createInfoScreen("test", formattedToday)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, "2023-01-32", true)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, "2023-01-30", true)).toBeTruthy();
    done();
  });

  test("createInfoScreen: makes sure start date is in the future (or today)", (done) => {
    expect(configInfoScreens.createInfoScreen("test", null)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedYesterday, null, true)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
    done();
  });

  test("createInfoScreen: makes sure end date is in the future (or end of today)", (done) => {
    expect(configInfoScreens.createInfoScreen("test", null)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedYesterday, null, true)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, formattedYesterday, true)).toBeFalsy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, formattedTomorrow, true)).toBeTruthy();
    expect(configInfoScreens.createInfoScreen("test", formattedToday, formattedTomorrow, false)).toBeTruthy();
    done();
  });

  test("createInfoScreen: pushes to the list of info screens correctly", (done) => {
    configInfoScreens.createInfoScreen("test", formattedToday, formattedTomorrow, false);
    expect(configInfoScreens.getInfoScreens().length).toBe(1);

    configInfoScreens.createInfoScreen("test 2", formattedToday, formattedTomorrow, true);
    expect(configInfoScreens.getInfoScreens().length).toBe(2);
    done();
  });

  test.skip("createInfoScreen: saves the info screens correctly", (done) => {
    const spy = jest.spyOn(configInfoScreens, "saveInfoScreens");
    configInfoScreens.createInfoScreen("test", formattedToday, formattedTomorrow, false);
    configInfoScreens.createInfoScreen("test 2", formattedToday, formattedTomorrow, true);
    expect(spy).toHaveBeenCalled();
    done();
  });

  test("saveInfoScreens: saves the info to file as expected", (done) => {
    configInfoScreens.createInfoScreen("test\nwith a line break", formattedToday, formattedTomorrow, false);
    configInfoScreens.createInfoScreen("test 2", formattedToday, formattedTomorrow, true);

    configInfoScreens.saveInfoScreens((resp) => {
      expect(resp).toBe(true);
      done();
    });
  });

  test("cleanupStaleInfoScreens: cleans up screens correctly", (done) => {
    configInfoScreens.getInfoScreens().push({ id: 1, message: "a", start: formattedToday, end: formattedTomorrow });
    configInfoScreens.getInfoScreens().push({
      id: 2,
      message: "b",
      start: format(subDays(new Date(), 3), "yyyy-MM-dd"),
      end: formattedYesterday,
    });
    configInfoScreens.getInfoScreens().push({ id: 2, message: "c", start: formattedToday, end: "", isFinite: true });

    configInfoScreens.cleanupStaleInfoScreens();
    expect(configInfoScreens.getInfoScreens().length).toBe(2);
    done();
  });
});
