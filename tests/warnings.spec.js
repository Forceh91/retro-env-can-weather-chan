import { shallowMount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Warnings from "../src/components/warnings";

const fakeWarning = { description: "weather warning", type: "warning", priority: "high" };
const fakeEndedWarning = { description: "weather warning", type: "ended", priority: "high" };
const fakeUrgentWarning = { description: "weather warning", type: "warning", priority: "urgent" };
const fakeEndedUrgentWarning = { description: "weather warning", type: "ended", priority: "urgent" };

const wrapper = shallowMount(Warnings, { props: { city: "City" } });
const { vm } = wrapper;

test("warningsUnavailable: computes correctly", (done) => {
  expect(vm.warningsUnavailable).toBe(true);
  done();
});

test("generateWarningsScreen: skips over generating warnings list if there are no warnings", (done) => {
  EventBus.off("warnings-complete");
  EventBus.on("warnings-complete", () => {
    done();
  });

  vm.generateWarningsScreen();
});

test("generateWarningsScreen: converts the warnings into a list if there is just one warning", (done) => {
  wrapper.setProps({ warnings: { event: { description: "weather warning", type: "warning", priority: "high" } } });
  vm.$nextTick(() => {
    vm.generateWarningsScreen();

    expect(vm.warningsUnavailable).toBe(false);
    expect(vm.warningsList.length).toBe(1);
    done();
  });
});

test("generateWarningsScreen: copies warnings over correctly when there are multiple", (done) => {
  wrapper.setProps({ warnings: { event: [fakeWarning, fakeWarning] } });

  vm.$nextTick(() => {
    vm.generateWarningsScreen();

    expect(vm.warningsUnavailable).toBe(false);
    expect(vm.warningsList.length).toBe(2);
    done();
  });
});

test("generateWarningsScreen: generates the correct number of pages", (done) => {
  vm.generateWarningsScreen();
  expect(vm.pages).toBe(1);

  wrapper.setProps({ warnings: { event: [fakeWarning, fakeWarning, fakeWarning] } });

  vm.$nextTick(() => {
    vm.generateWarningsScreen();
    expect(vm.pages).toBe(2);
    done();
  });
});

test("shouldFlashWarning: will flash a warning if it is urgent", (done) => {
  expect(vm.shouldFlashWarning(fakeWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeEndedWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeEndedUrgentWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeUrgentWarning)).toBe(true);
  done();
});
