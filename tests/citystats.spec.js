import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import citystats from "../src/components/citystats";
import ecdata from "./data/ecdata";

import { getFreshStore } from "./build";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(citystats, { global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
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

test("padString: pads strings correctly when a char is given", (done) => {
  const stringA = vm.padString("-15.5", 5, false, ".");
  expect(stringA).toBe("-15.5");

  const stringB = vm.padString("15.5", 5, false, ".");
  expect(stringB).toBe("15.5.");

  const stringC = vm.padString("5.5", 5, false, ".");
  expect(stringC).toBe("5.5..");

  const stringD = vm.padString("15.5", 4, false, ".");
  expect(stringD).toBe("15.5");

  const stringE = vm.padString("-15", 6, true, ".");
  expect(stringE).toBe("...-15");

  const stringF = vm.padString("15", 6, true, ".");
  expect(stringF).toBe("....15");

  const stringG = vm.padString("5", 6, true, ".");
  expect(stringG).toBe(".....5");

  const stringH = vm.padString("15.5", 4, true, ".");
  expect(stringH).toBe("15.5");

  done();
});

test("padString: doesn't error when no string is passed", (done) => {
  const stringA = vm.padString(null, 5);
  expect(stringA).toBe("");

  const stringB = vm.padString(undefined, 5);
  expect(stringB).toBe("");

  done();
});

test("sunriseset: is computed properly", (done) => {
  expect(vm.sunriseset).toBeTruthy();
  expect(vm.sunriseset.length).toBeGreaterThanOrEqual(32);
  done();
});

test("pad: pads out numbers less than 10 with a 0", (done) => {
  const padA = vm.pad(8);
  expect(padA).toBe("08");

  const padB = vm.pad(11);
  expect(padB).toBe(11);

  done();
});

test("titleString: is computed correctly", (done) => {
  wrapper.setProps({ city: "Winnipeg" });
  vm.$nextTick(() => {
    expect(vm.titleString).toContain("Winnipeg Statistics - ");
    done();
  });
});

test("hotColdTitleString: is computed correctly", (done) => {
  expect(vm.hotColdTitleString).toContain("Canadian Hot/Cold Spot ");
  done();
});

test("hotSpotString: is computed correctly", (done) => {
  expect(vm.hotSpotString).toStrictEqual(`&nbsp;Sarnia,&nbsp;ON&nbsp;................&nbsp;28`);
  done();
});

test("coldSpotString: is computed correctly", (done) => {
  expect(vm.coldSpotString).toStrictEqual(`&nbsp;Isachsen,&nbsp;NU&nbsp;..............&nbsp;-9`);
  done();
});

test("precipTitle: is computed correctly", (done) => {
  expect(vm.precipTitle).toBe("Total Precipitation Since");

  wrapper.setProps({ isWinter: true });
  vm.$nextTick(() => {
    expect(vm.precipTitle).toBe("Total Precipitation Since");
    done();
  });
});

test("precipActual: is computed correctly", async (done) => {
  await wrapper.setProps({ seasonPrecip: { totalPrecip: "400.4" } });
  expect(vm.precipActual).toBe("&nbsp;&nbsp;April 1st&nbsp;...........400.4 MM");

  await wrapper.setProps({ isWinter: true });
  expect(vm.precipActual).toBe("&nbsp;&nbsp;October 1st&nbsp;.........400.4 MM");

  await wrapper.setProps({ seasonPrecip: { totalPrecip: "0.4" } });
  expect(vm.precipActual).toBe("&nbsp;&nbsp;October 1st&nbsp;.........&nbsp;&nbsp;0.4 MM");
  done();
});

test("precipNormal: is computed correctly", async (done) => {
  await wrapper.setProps({ seasonPrecip: { normalPrecip: "163.3" } });
  expect(vm.precipNormal).toBe("&nbsp;&nbsp;Normal&nbsp;..............163.3 MM");

  await wrapper.setProps({ seasonPrecip: { normalPrecip: "3.3" } });
  expect(vm.precipNormal).toBe("&nbsp;&nbsp;Normal&nbsp;..............&nbsp;&nbsp;3.3 MM");
  done();
});
