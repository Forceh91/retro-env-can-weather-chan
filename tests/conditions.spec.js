import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { parseISO, format } from "date-fns";
import conditions from "../src/components/conditions";

import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(conditions, { global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("titleString: is computed properly", (done) => {
  const time = parseISO(ecdata.observed.stationTime);
  let monthFormat = format(time, "MMM dd/yy");

  expect(vm.titleString).toContain(`&nbsp;Winnipeg&nbsp;&nbsp;&nbsp;`);
  expect(vm.titleString).toContain(`${ecdata.observed.stationTimezone}&nbsp;`);
  expect(vm.titleString).toContain(`${monthFormat}`);
  done();
});

test("observedFormatted: is computed properly", (done) => {
  //WINNIPEG   11 AM CDT SEP 17/22
  //WINNIPEG   NOON      SEP 17/22
  //WINNIPEG   MIDNIGHT  SEP 17/22
  //WINNIPEG   6 AM CDT  SEP 17/22
  let time = parseISO(ecdata.observed.stationTime);
  const timezone = ecdata.observed.stationTimezone;

  let hourFormat = format(time, "h aa");
  let monthFormat = format(time, "MMM dd/yy");
  expect(vm.observedFormatted).toContain(`${hourFormat} ${timezone}`);
  expect(vm.observedFormatted).toContain(`${monthFormat}`);

  time = "2022-09-16T22:00:00.000Z";
  vm.$store.commit("setObservedStationTime", time);

  let timeObj = parseISO(time);
  hourFormat = format(timeObj, "h aa");

  let hours = timeObj.getHours();
  let spacing = "&nbsp;";
  if (hours < 10 || (hours > 12 && hours < 22)) spacing = "&nbsp;&nbsp;";
  expect(vm.observedFormatted).toStrictEqual(`${hourFormat} ${timezone}${spacing}Sep 16/22`);

  time = "2022-09-09T14:00:00.000Z";
  vm.$store.commit("setObservedStationTime", time);

  timeObj = parseISO(time);
  hourFormat = format(timeObj, "h aa");
  hours = timeObj.getHours();
  spacing = "&nbsp;";
  if (hours < 10 || (hours > 12 && hours < 22)) spacing = "&nbsp;&nbsp;";
  expect(vm.observedFormatted).toStrictEqual(`${hourFormat} ${timezone}${spacing}Sep&nbsp;&nbsp;9/22`);

  const noon = new Date(2022, 8, 9, 12, 0, 0);
  vm.$store.commit("setObservedStationTime", noon.toISOString());
  expect(vm.observedFormatted).toStrictEqual(`Noon&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Sep&nbsp;&nbsp;9/22`);

  const midnight = new Date(2022, 8, 9, 0, 0, 0);
  vm.$store.commit("setObservedStationTime", midnight.toISOString());
  expect(vm.observedFormatted).toStrictEqual(`Midnight&nbsp;&nbsp;Sep&nbsp;&nbsp;9/22`);
  done();
});

test("currentCondition: is computed properly", (done) => {
  expect(vm.currentCondition).toBe("Rain");

  vm.$store.commit("setCurrentConditions", "Thunderstorms with heavy rain shower");
  expect(vm.currentCondition).toBe("Thunderstorms");

  vm.$store.commit("setCurrentConditions", "snow and freezing rain");
  expect(vm.currentCondition).toBe("snow");

  vm.$store.commit("setCurrentConditions", "light rainshower");
  expect(vm.currentCondition).toBe("light rainshower");

  vm.$store.commit("setCurrentConditions", "freezing rain");
  expect(vm.currentCondition).toBe("freezing rain");

  vm.$store.commit("setCurrentConditions", "partly cloudy");
  expect(vm.currentCondition).toBe("partly cloudy");

  vm.$store.commit("setCurrentConditions", "clear");
  expect(vm.currentCondition).toBe("clear");
  done();
});

test("temperature: is computed properly", (done) => {
  expect(vm.temperature).toBe("12 C");

  vm.$store.commit("setCurrentTemperature", 0.3);
  expect(vm.temperature).toBe("0 C");

  vm.$store.commit("setCurrentTemperature", 0.6);
  expect(vm.temperature).toBe("1 C");

  vm.$store.commit("setCurrentTemperature", -0.4);
  expect(vm.temperature).toBe("0 C");

  vm.$store.commit("setCurrentTemperature", -11.4);
  expect(vm.temperature).toBe("-11 C");

  vm.$store.commit("setCurrentTemperature", null);
  expect(vm.temperature).toBe("N/A C");

  done();
});

test("wind: is computed properly", (done) => {
  expect(vm.wind).toBe("ENE&nbsp;&nbsp;13 KMH");

  vm.$store.commit("setCurrentWind", null);
  expect(vm.wind).toBe("&nbsp;&nbsp;CALM");

  vm.$store.commit("setCurrentWind", { gust: 72, speed: 45, direction: "NW" });
  expect(vm.wind).toBe("&nbsp;NW&nbsp;&nbsp;45G72&nbsp;");

  vm.$store.commit("setCurrentWind", { gust: null, speed: 22, direction: "S" });
  expect(vm.wind).toBe("&nbsp;&nbsp;S&nbsp;&nbsp;22 KMH");

  vm.$store.commit("setCurrentWind", { speed: 6, direction: "S" });
  expect(vm.wind).toBe("&nbsp;&nbsp;S&nbsp;&nbsp;&nbsp;6 KMH");

  vm.$store.commit("setCurrentWind", { speed: 102, direction: "S" });
  expect(vm.wind).toBe("&nbsp;&nbsp;S&nbsp;102 KMH");

  vm.$store.commit("setCurrentWind", { speed: 1, direction: "S" });
  expect(vm.wind).toBe("&nbsp;&nbsp;CALM");

  vm.$store.commit("setCurrentWind", { speed: 0, direction: "S" });
  expect(vm.wind).toBe("&nbsp;&nbsp;CALM");

  done();
});

test("humidity: is computed correctly", (done) => {
  expect(vm.humidity).toBe("99 %");

  vm.$store.commit("setCurrentHumidity", 9);
  expect(vm.humidity).toBe("&nbsp;9 %");

  vm.$store.commit("setCurrentHumidity", null);
  expect(vm.humidity).toBe("N/A %");
  done();
});

test("visibility: is computed correctly", (done) => {
  expect(vm.visibility).toBe("16 km");

  vm.$store.commit("setCurrentVisibility", 24);
  expect(vm.visibility).toBe("24 km");

  vm.$store.commit("setCurrentVisibility", 0.8);
  expect(vm.visibility).toBe("800 m");

  vm.$store.commit("setCurrentVisibility", 0.6);
  expect(vm.visibility).toBe("600 m");

  vm.$store.commit("setCurrentVisibility", 0.4);
  expect(vm.visibility).toBe("400 m");

  vm.$store.commit("setCurrentVisibility", 0.2);
  expect(vm.visibility).toBe("200 m");

  vm.$store.commit("setCurrentVisibility", null);
  expect(vm.visibility).toBe("");

  done();
});

test("pressure: is computed correctly", (done) => {
  expect(vm.pressure).toBe("101.1 kPa&nbsp;&nbsp;rising");

  vm.$store.commit("setCurrentPressure", { value: 100.8, tendency: "falling" });
  expect(vm.pressure).toBe("100.8 kPa&nbsp;&nbsp;falling");

  vm.$store.commit("setCurrentPressure", { value: 99.5, tendency: "rising" });
  expect(vm.pressure).toBe("&nbsp;99.5 kPa&nbsp;&nbsp;rising");

  vm.$store.commit("setCurrentPressure", null);
  expect(vm.pressure).toBe("");

  done();
});

test("shouldShowWindchill: is computed correctly", (done) => {
  expect(vm.shouldShowWindchill).toBe(false);

  vm.$store.commit("setWindchill", 1650);
  expect(vm.shouldShowWindchill).toBe(true);

  done();
});

test("windchill: is computed correctly", (done) => {
  expect(vm.ecWindchill).toBe(0);

  const chillsToTest = [1650, 1400, 1500, 1700];
  chillsToTest.forEach((chill) => {
    vm.$store.commit("setWindchill", chill);
    expect(vm.ecWindchill).toBe(chill);
  });

  done();
});

it("shouldShowExtraData: is computed correctly", (done) => {
  expect(vm.shouldShowExtraData).toBe(true);

  vm.$store.commit("setAirQuality", null);
  expect(vm.shouldShowExtraData).toBe(false);

  vm.$store.commit("setWindchill", 1350);
  expect(vm.shouldShowExtraData).toBe(true);

  done();
});

it("shouldShowAQHI: is computed correctly", (done) => {
  expect(vm.shouldShowExtraData).toBe(true);
  expect(vm.shouldShowAQHI).toBe(true);
  expect(vm.aqhiSummary).toBe("Good");

  vm.$store.commit("setWindchill", 1350);
  expect(vm.shouldShowAQHI).toBe(false);
  expect(vm.shouldShowWindchill).toBe(true);
  expect(vm.shouldShowExtraData).toBe(true);
  done();
});

test("padString: pads strings correctly", (done) => {
  const stringA = vm.padString("-15.5", 5);
  expect(stringA).toBe("-15.5");

  const stringB = vm.padString("15.5", 5);
  expect(stringB).toBe("15.5&nbsp;");

  const stringC = vm.padString("5.5", 5);
  expect(stringC).toBe("5.5&nbsp;&nbsp;");

  const stringD = vm.padString("15.5", 4);
  expect(stringD).toBe("15.5");

  const stringE = vm.padString("-15.5", 5, true);
  expect(stringE).toBe("-15.5");

  const stringF = vm.padString("15.5", 5, true);
  expect(stringF).toBe("&nbsp;15.5");

  const stringG = vm.padString("5.5", 5, true);
  expect(stringG).toBe("&nbsp;&nbsp;5.5");

  const stringH = vm.padString("15.5", 4, true);
  expect(stringH).toBe("15.5");

  done();
});
