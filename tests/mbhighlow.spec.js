import { shallowMount } from "@vue/test-utils";
import mbhighlow from "../src/components/mbhighlow";
import { EventBus } from "../src/js/EventBus";
import mbhighlowdata from "./data/mbhighlow";

const wrapper = shallowMount(mbhighlow, { props: {} });
const { vm } = wrapper;

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
    wrapper.setProps({ data: mbhighlowdata.values, timezone: "CDT", tempclass: mbhighlowdata.tempClass });
    done();
  });

  wrapper.setProps({ enabled: true, data: [] });
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

test("padString: doesn't error when no string is passed", (done) => {
  const stringA = vm.padString(null, 5);
  expect(stringA).toBe("");

  const stringB = vm.padString("", 5);
  expect(stringB).toBe("");

  done();
});

test("sortedHighsLows: is computed correctly", (done) => {
  expect(vm.sortedHighsLows).toStrictEqual([...mbhighlowdata.values].sort((a, b) => a.city > b.city));
  done();
});

test("timeOfDay: computes correctly for overnight", (done) => {
  expect(vm.timeOfDay).toBe("Overnight");
  done();
});

test("tempClass: computes correctly for overnight", (done) => {
  expect(vm.tempClass).toBe("low:");
  done();
});

test("topLine: computes correctly for low temp class", (done) => {
  expect(vm.topLine).toContain(vm.padString("Overnight", 17, true));
  done();
});

test("bottomLine: computes correctly for low temp class", (done) => {
  expect(vm.bottomLine).toContain(vm.padString("low:", 17, true));
  done();
});

test("timeOfDay: computes correctly for today", (done) => {
  wrapper.setProps({ tempclass: "high" });
  vm.$nextTick(() => {
    expect(vm.timeOfDay).toBe("Today:");
    done();
  });
});

test("tempClass: computes correctly for today", (done) => {
  expect(vm.tempClass).toBe("high");
  done();
});

test("topLine: computes correctly for high temp class", (done) => {
  expect(vm.topLine).toContain(vm.padString("high", 17, true));
  done();
});

test("bottomLine: computes correctly for high temp class", (done) => {
  expect(vm.bottomLine).toContain(vm.padString("Today:", 17, true));
  done();
});

test("bottomPrecipLine: includes the timezone correctly", (done) => {
  expect(vm.bottomPrecipLine).toBe(`&nbsp;&nbsp;&nbsp;To 7 AM ${vm.timezone}`);
  done();
});
