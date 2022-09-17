import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import outlook from "../src/components/outlook";
import outlookdata from "./data/outlook";
import normalsdata from "./data/outlooknormals";

import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () =>
  shallowMount(outlook, {
    props: { forecast: outlookdata, normals: normalsdata },
    global: { plugins: [getFreshStore(ecdata)] },
  });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("computed: titleString: computes correctly", (done) => {
  expect(vm.titleString).toStrictEqual("Outlook for Southern Manitoba");
  done();
});

test("computed: outlookUnavailable: computes correctly (1/2)", (done) => {
  expect(vm.outlookUnavailable).toBe(false);

  wrapper.setProps({ forecast: null });
  vm.$nextTick(() => {
    expect(vm.outlookUnavailable).toBe(true);
    done();
  });
});

test("computed: outlookUnavailable: computes correctly (2/2)", (done) => {
  expect(vm.outlookUnavailable).toBe(false);

  vm.generatedOutlook = null;
  expect(vm.outlookUnavailable).toBe(true);

  vm.generatedOutlook = [];
  expect(vm.outlookUnavailable).toBe(true);

  vm.get3To5DayOutlook();
  expect(vm.outlookUnavailable).toBe(false);
  done();
});

test("computed: longestDayInOutlook: computes correctly", (done) => {
  const longestDay = Math.max(...vm.generatedOutlook.map((go) => go.day.length || 0));
  expect(vm.longestDayInOutlook).toBe(longestDay);

  vm.generatedOutlook = [];
  expect(vm.longestDayInOutlook).toBe(0);

  done();
});

test("computed: normalLowString: computes correctly", (done) => {
  expect(vm.normalLowString).toBe("Normal Low 16.");
  done();
});

test("computed: normalHighString: computes correctly", (done) => {
  expect(vm.normalHighString).toBe("Normal High 26.");
  done();
});

test("get3To5DayOutlook: generates a 3-5 day outlook correctly", (done) => {
  expect(vm.generatedOutlook).not.toBe([]);
  expect(vm.generatedOutlook).not.toBe(null);
  expect(vm.generatedOutlook.length).toBe(3);
  expect(vm.generatedOutlook[0].hasOwnProperty("day")).toBe(true);
  expect(vm.generatedOutlook[0].hasOwnProperty("high")).toBe(true);
  expect(vm.generatedOutlook[0].hasOwnProperty("low")).toBe(true);
  expect(vm.generatedOutlook[0].hasOwnProperty("condition")).toBe(true);
  done();
});
