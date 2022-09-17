import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";
import lastmonth from "../src/components/lastmonth";
import lastmonthdata from "./data/lastmonthdata";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () =>
  shallowMount(lastmonth, { props: { lastMonth: lastmonthdata }, global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("summaryTitle: computes correctly", (done) => {
  expect(vm.summaryTitle).toBe(`Weather Statistics for June`);
  done();
});

test("tableHeader: computes correctly", (done) => {
  expect(vm.tableHeader).toBe("&nbsp;Winnipeg&nbsp;&nbsp;&nbsp;&nbsp;This Year&nbsp;&nbsp;Normal");
  done();
});

test("averageHighData: computes correctly", (done) => {
  expect(vm.averageHighData).toBe("Average High&nbsp;&nbsp;&nbsp;&nbsp;23.6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;23.2");
  done();
});

test("averageLowData: computes correctly", (done) => {
  expect(vm.averageLowData).toBe("Average Low&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;11.2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;10.7");
  done();
});

test("precipData: computes correctly", (done) => {
  expect(vm.precipData).toBe("Precip (MM)&nbsp;&nbsp;&nbsp;&nbsp;116.0&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;90.0");
  done();
});

test("warmestDayTemp: computes correctly", (done) => {
  expect(vm.warmestDayTemp).toStrictEqual("+37.0");
  done();
});

test("warmestTempData: computes correctly", (done) => {
  expect(vm.warmestTempData).toBe("Warmest Temp.&nbsp;+37.0&nbsp;ON THE 19th.");
  done();
});

test("coldestDayTemp: computes correctly", (done) => {
  expect(vm.coldestDayTemp).toStrictEqual("+2.2");
  done();
});

test("coldestTempData: computes correctly", (done) => {
  expect(vm.coldestTempData).toBe("Coldest Temp.&nbsp;&nbsp;+2.2&nbsp;ON THE &nbsp;4th");
  done();
});
