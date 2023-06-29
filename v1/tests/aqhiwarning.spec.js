import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import aqhiwarning from "../src/components/aqhiwarning";
import aqhi from "./data/aqhi";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(aqhiwarning, { props: { aqhi } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("doesAQHINeedWarning: is computed correctly", (done) => {
  expect(vm.doesAQHINeedWarning).toBe(true);

  wrapper.setProps({ aqhi: { needsWarning: false } });
  vm.$nextTick(() => {
    expect(vm.doesAQHINeedWarning).toBe(false);
    done();
  });
});

test("observedTime: is computed correctly", (done) => {
  expect(vm.observedTime).toBe("&nbsp;4 PM");
  done();
});

test("observedMonthDate: is computed correctly", (done) => {
  expect(vm.observedMonthDate).toBe("Jul &nbsp;5");
  done();
});

test("observedAQHI: is computed correctly", (done) => {
  expect(vm.observedAQHI).toBe("&nbsp;5");

  wrapper.setProps({ aqhi: {} });
  vm.$nextTick(() => {
    expect(vm.observedAQHI).toBe("&nbsp;&nbsp;");
    done();
  });
});

test("observedTimeAndIndex: is computed correctly", (done) => {
  expect(vm.observedTimeAndIndex).toBe("&nbsp;4 PM Jul &nbsp;5 IS &nbsp;5-Moderate Risk");
  done();
});

test("aqhiWarningMessage: is computed correctly", (done) => {
  expect(vm.aqhiWarningMessage).toContain("CONSIDER MODIFYING YOUR USUAL");
  done();
});

test("getAQHIRisk: returns the correct values", (done) => {
  expect(vm.getAQHIRisk(11)).toBe("V High");
  expect(vm.getAQHIRisk(7)).toBe("High");
  expect(vm.getAQHIRisk(5)).toBe("Moderate");
  expect(vm.getAQHIRisk(2)).toBe("");
  done();
});

test("getAQHIWarningMessage: returns the correct values", (done) => {
  expect(vm.getAQHIWarningMessage(11)).toContain("REDUCE/RESCHEDULE STRENUOUS");
  expect(vm.getAQHIWarningMessage(7)).toContain("CONSIDER REDUCING/RESCHEDULING");
  expect(vm.getAQHIWarningMessage(5)).toContain("CONSIDER MODIFYING YOUR USUAL");
  expect(vm.getAQHIWarningMessage(2)).toBe("");
  done();
});
