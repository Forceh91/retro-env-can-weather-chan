import { createInfoScreen } from "../config/info-screens";
import { addDays, format, subDays } from "date-fns";

const longMessage =
  "a really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\na really long info screen\n";

const today = new Date();
const formattedToday = format(today, "yyyy-MM-dd");
const formattedYesterday = format(subDays(today, 1), "yyyy-MM-dd");
const formattedTomorrow = format(addDays(today, 1), "yyyy-MM-dd");

test("createInfoScreen: checks message length is valid", (done) => {
  expect(createInfoScreen()).toBeFalsy();
  expect(createInfoScreen(longMessage)).toBeFalsy();
  expect(createInfoScreen("a short message", formattedToday, null, true)).toBeTruthy();
  done();
});

test("createInfoScreen: makes sure end or isInfinite is set", (done) => {
  expect(createInfoScreen("test", formattedToday)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, "2022-12-14")).toBeTruthy();
  expect(createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
  done();
});

test("createInfoScreen: makes sure start date is set correctly", (done) => {
  expect(createInfoScreen("test", null)).toBeFalsy();
  expect(createInfoScreen("test", "2022-12-32", null, true)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
  done();
});

test("createInfoScreen: make sure end date is set correctly", (done) => {
  expect(createInfoScreen("test", formattedToday)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, "2023-01-32", true)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, "2023-01-30", true)).toBeTruthy();
  done();
});

test("createInfoScreen: makes sure start date is in the future (or today)", (done) => {
  expect(createInfoScreen("test", null)).toBeFalsy();
  expect(createInfoScreen("test", formattedYesterday, null, true)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, null, true)).toBeTruthy();
  done();
});

test("createInfoScreen: makes sure end date is in the future (or end of today)", (done) => {
  expect(createInfoScreen("test", null)).toBeFalsy();
  expect(createInfoScreen("test", formattedYesterday, null, true)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, formattedYesterday, true)).toBeFalsy();
  expect(createInfoScreen("test", formattedToday, formattedTomorrow, true)).toBeTruthy();
  done();
});
