import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { subDays, format, parseISO } from "date-fns";

import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";

import { EventBus } from "../src/js/EventBus";
import mbhighlow from "../src/components/mbhighlow";
import mbhighlowdata from "./data/mbhighlow";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(mbhighlow, { global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("checkScreenIsEnabled: sends off an event correctly when the screen isn't enabled", (done) => {
  EventBus.on("mbhighlow-complete", () => {
    EventBus.off("mbhighlow-complete");
    done();
  });

  vm.checkScreenIsEnabled();
});

test("checkScreenIsEnabled: sends off an event correctly when the screen isn't enabled", (done) => {
  EventBus.on("mbhighlow-complete", () => {
    EventBus.off("mbhighlow-complete");
    done();
  });

  wrapper.setProps({ enabled: false });
  vm.$nextTick(() => {
    vm.checkScreenIsEnabled();
  });
});

test("checkScreenIsEnabled: sends off an event correctly when the screen is enabled but has no data", (done) => {
  EventBus.on("mbhighlow-complete", () => {
    EventBus.off("mbhighlow-complete");
    done();
  });

  wrapper.setProps({ enabled: true });
  vm.$nextTick(() => {
    vm.checkScreenIsEnabled();
  });
});

test("checkScreenIsEnabled: sends off an event correctly when the screen is enabled but has no data", (done) => {
  EventBus.on("mbhighlow-complete", () => {
    EventBus.off("mbhighlow-complete");
    wrapper.setProps({ manitobaData: mbhighlowdata, timezone: "CDT" });
    done();
  });

  wrapper.setProps({ enabled: true, manitobaData: { period: "min_temp" } });
  vm.$nextTick(() => {
    vm.checkScreenIsEnabled();
  });
});

test("padString: pads strings correctly when a length is given", (done) => {
  const stringA = vm.padString("-15.5", 5);
  expect(stringA).toBe("-15.5");

  const stringB = vm.padString("15.5", 5);
  expect(stringB).toBe("15.5&nbsp;");

  const stringC = vm.padString("5.5", 5);
  expect(stringC).toBe("5.5&nbsp;&nbsp;");

  const stringD = vm.padString("15.5", 4);
  expect(stringD).toBe("15.5");

  const stringE = vm.padString("-15", 6, true);
  expect(stringE).toBe("&nbsp;&nbsp;&nbsp;-15");

  const stringF = vm.padString("15", 6, true);
  expect(stringF).toBe("&nbsp;&nbsp;&nbsp;&nbsp;15");

  const stringG = vm.padString("5", 6, true);
  expect(stringG).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5");

  const stringH = vm.padString("15.5", 4, true);
  expect(stringH).toBe("15.5");

  done();
});

test("timeOfDay: computes correctly for overnight", (done) => {
  wrapper.setProps({ manitobaData: { period: "min_temp" } });
  vm.$nextTick(() => {
    expect(vm.timeOfDay).toBe("Overnight");
    done();
  });
});

test("yesterday: computes correctly", (done) => {
  const yesterday = subDays(parseISO(vm.ecObservedAtStation.time), 1);
  expect(vm.yesterday.getDate()).toBe(yesterday.getDate());
  done();
});

test("yesterdayDateFormatted: computes correctly", (done) => {
  const yesterday = subDays(parseISO(vm.ecObservedAtStation.time), 1);
  const yesterdayFormatted = format(yesterday, "MMM dd");

  expect(vm.yesterdayDateFormatted).toBe(yesterdayFormatted);
  done();
});

test("tempClass: computes correctly for overnight", (done) => {
  wrapper.setProps({ manitobaData: { period: "min_temp" } });
  vm.$nextTick(() => {
    expect(vm.tempClass).toBe("Low:");
    done();
  });
});

test("tempClass: computes correctly for today/yesterday", (done) => {
  wrapper.setProps({ manitobaData: { period: "max_temp" } });
  vm.$nextTick(() => {
    expect(vm.tempClass).toBe("High");
    done();
  });
});

test("topLine: computes correctly for low temp class", async (done) => {
  await wrapper.setProps({ manitobaData: { period: "min_temp" } });
  expect(vm.topLine).toContain(vm.padString("Overnight", 17, true));
  done();
});

test("bottomLine: computes correctly for low temp class", async (done) => {
  await wrapper.setProps({ manitobaData: { period: "min_temp" } });
  expect(vm.bottomLine).toContain(vm.padString("Low:", 17, true));
  done();
});

test("timeOfDay: computes correctly for today", async (done) => {
  await wrapper.setProps({ manitobaData: { period: "max_temp" } });
  vm.$nextTick(() => {
    const date = new Date();
    const todayYesterdayForMaxTemp = date.getHours() < 20 ? "Yesterday:" : "Today:";
    expect(vm.timeOfDay).toBe(todayYesterdayForMaxTemp);
    done();
  });
});

test("tempClass: computes correctly for today", (done) => {
  expect(vm.tempClass).toBe("High");
  done();
});

test("topLine: computes correctly for high temp class", (done) => {
  expect(vm.topLine).toContain(vm.padString("High", 17, true));
  done();
});

test("bottomLine: computes correctly for high temp class", (done) => {
  const date = new Date();
  const todayYesterdayForMaxTemp = date.getHours() < 20 ? "Yesterday:" : "Today:";
  expect(vm.bottomLine).toContain(vm.padString(todayYesterdayForMaxTemp, 17, true));
  done();
});

test("bottomPrecipLine: includes the timezone correctly", (done) => {
  const yesterday = subDays(parseISO(vm.ecObservedAtStation.time), 1);
  const yesterdayFormatted = format(yesterday, "MMM dd");

  expect(vm.bottomPrecipLine).toBe(`&nbsp;&nbsp;&nbsp;&nbsp;For ${yesterdayFormatted}`);
  done();
});

test("parseDisplayTemp: generates correctly for no data", (done) => {
  const expectedTemp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;M";
  expect(vm.parseDisplayTemp()).toBe(expectedTemp);
  expect(vm.parseDisplayTemp(null)).toBe(expectedTemp);
  expect(vm.parseDisplayTemp(undefined)).toBe(expectedTemp);
  done();
});

test("parseDisplayTemp: generates correctly for a float as a string", (done) => {
  expect(vm.parseDisplayTemp("25.2")).toBe("&nbsp;&nbsp;&nbsp;&nbsp;25");
  expect(vm.parseDisplayTemp("16.7")).toBe("&nbsp;&nbsp;&nbsp;&nbsp;17");
  expect(vm.parseDisplayTemp("9.9")).toBe("&nbsp;&nbsp;&nbsp;&nbsp;10");
  done();
});

test("parseDisplayTemp: generates correctly for a negative float as a string", (done) => {
  expect(vm.parseDisplayTemp("-25.2")).toBe("&nbsp;&nbsp;&nbsp;-25");
  expect(vm.parseDisplayTemp("-16.7")).toBe("&nbsp;&nbsp;&nbsp;-17");
  expect(vm.parseDisplayTemp("-9.9")).toBe("&nbsp;&nbsp;&nbsp;-10");
  done();
});

test("parseDisplayTemp: generates correctly for a float", (done) => {
  expect(vm.parseDisplayTemp(25.2)).toBe("&nbsp;&nbsp;&nbsp;&nbsp;25");
  expect(vm.parseDisplayTemp(-16.7)).toBe("&nbsp;&nbsp;&nbsp;-17");
  expect(vm.parseDisplayTemp(3)).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3");
  done();
});

test("generatePrecipString: generates correctly for no data", (done) => {
  expect(vm.generatePrecipString()).toBe("MISSING");
  done();
});

test("generatePrecipString: returns correctly if the value is a string", (done) => {
  expect(vm.generatePrecipString({ value: "MSNG" })).toBe("MSNG");
  expect(vm.generatePrecipString({ value: "" })).toBe("MISSING");
  done();
});

test("generatePrecipString: returns NIL correctly", (done) => {
  expect(vm.generatePrecipString({ value: "0.0" })).toBe("&nbsp;&nbsp;&nbsp;NIL");
  done();
});

test("generatePrecipString: returns TRACE correctly", (done) => {
  expect(vm.generatePrecipString({ value: "0.16" })).not.toBe("&nbsp;&nbsp;&nbsp;&nbsp;TRACE");
  expect(vm.generatePrecipString({ value: "0.15" })).toBe("&nbsp;&nbsp;TRACE");
  expect(vm.generatePrecipString({ value: "0.12" })).toBe("&nbsp;&nbsp;TRACE");
  expect(vm.generatePrecipString({ value: "0.06" })).toBe("&nbsp;&nbsp;TRACE");
  done();
});

test("generatePrecipString: returns other values correctly", (done) => {
  expect(vm.generatePrecipString({ value: "0.16", units: "mm" })).not.toBe("0.2 mm");
  expect(vm.generatePrecipString({ value: "0.3", units: "mm" })).toBe("&nbsp;&nbsp;0.3 mm");
  expect(vm.generatePrecipString({ value: "1.6", units: "mm" })).toBe("&nbsp;&nbsp;1.6 mm");
  expect(vm.generatePrecipString({ value: "3.4", units: "mm" })).toBe("&nbsp;&nbsp;3.4 mm");
  expect(vm.generatePrecipString({ value: "11.6", units: "mm" })).toBe("&nbsp;11.6 mm");
  done();
});
