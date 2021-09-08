import { shallowMount } from "@vue/test-utils";
import Almanac from "../src/components/almanac";
import almanacdata from "./data/almanac";

const wrapper = shallowMount(Almanac, { props: {} });
const { vm } = wrapper;

test("almanacUnavailable: computes correctly", (done) => {
  expect(vm.almanacUnavailable).toBe(true);

  wrapper.setProps({ almanac: almanacdata });
  expect(vm.almanacUnavailable).toBe(true);

  wrapper.setProps({ conditions: {} });

  vm.$nextTick(() => {
    expect(vm.almanacUnavailable).toBe(false);
    done();
  });
});

test("highLastYear: computes correctly", (done) => {
  expect(vm.highLastYear).toBe(`&nbsp;&nbsp;N/A`);
  done();
});

test("highNormal: computes correctly", (done) => {
  expect(vm.highNormal).toBe(`&nbsp;20.6`);
  done();
});

test("recordHigh: computes correctly", (done) => {
  expect(vm.recordHigh).toBe(`&nbsp;33.3`);
  done();
});

test("recordHighYear: computes correctly", (done) => {
  expect(vm.recordHighYear).toBe("1980");
  done();
});

test("lowLastYear: computes correctly", (done) => {
  expect(vm.lowLastYear).toBe(`&nbsp;&nbsp;N/A`);
  done();
});

test("lowNormal: computes correctly", (done) => {
  expect(vm.lowNormal).toBe(`&nbsp;&nbsp;7.8`);
  done();
});

test("recordLow: computes correctly", (done) => {
  expect(vm.recordLow).toBe(`&nbsp;&nbsp;0.6`);
  done();
});

test("recordLowYear: computes correctly", (done) => {
  expect(vm.recordLowYear).toBe("1956");
  done();
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
