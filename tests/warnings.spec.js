import { shallowMount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Warnings from "../src/components/warnings";

const fakeWarning = {
  identifier: "a",
  references: "a,b,c",
  expires: "2022-06-15T00:00:00",
  headline: "weather warning in effect",
  description: "stuff will happen",
  severity: "medium",
  urgency: "low",
};
const fakeEndedWarning = {
  identifier: "b",
  references: "a,b,c",
  expires: "2022-06-15T01:00:00",
  headline: "weather warning ended",
  description: "stuff will happen",
  severity: "clear",
  urgency: "past",
};
const fakeUrgentWarning = {
  identifier: "c",
  references: "a,b,c",
  expires: "2022-06-15T00:00:00",
  headline: "severe weather warning in effect",
  description: "stuff will happen Locations impacted: some location here ### when warning appears, run",
  severity: "medium",
  urgency: "Immediate",
};
const fakeEndedUrgentWarning = {
  identifier: "d",
  references: "a,b,c",
  expires: "2022-06-15T00:00:00",
  headline: "weather warning ended",
  description: "stuff wont happen",
  severity: "clear",
  urgency: "Past",
};

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
  wrapper.setProps({ warnings: [fakeWarning] });
  vm.$nextTick(() => {
    vm.generateWarningsScreen();

    expect(vm.warningsUnavailable).toBe(false);
    expect(vm.warningsList.length).toBe(1);
    done();
  });
});

test("generateWarningsScreen: copies warnings over correctly when there are multiple", (done) => {
  wrapper.setProps({ warnings: [fakeWarning, fakeWarning] });

  vm.$nextTick(() => {
    vm.generateWarningsScreen();

    expect(vm.warningsUnavailable).toBe(false);
    expect(vm.warningsList.length).toBe(2);
    done();
  });
});

test("generateWarningsScreen: generates the correct number of pages", (done) => {
  vm.generateWarningsScreen();
  expect(vm.pages).toBe(2);

  wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });

  vm.$nextTick(() => {
    vm.generateWarningsScreen();
    expect(vm.pages).toBe(3);
    done();
  });
});

test("generateWarningsScreen: changes page after 20s", (done) => {
  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateWarningsScreen();
  jest.advanceTimersByTime(20 * 1000);
  expect(spy).toHaveBeenCalled();
  expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 20 * 1000);
  done();
});

test("shouldFlashWarning: will flash a warning if it is urgent", (done) => {
  expect(vm.shouldFlashWarning()).toBe(false);
  expect(vm.shouldFlashWarning(fakeWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeEndedWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeEndedUrgentWarning)).toBe(false);
  expect(vm.shouldFlashWarning(fakeUrgentWarning)).toBe(true);
  done();
});

test("changePage: changes page correctly when there are multiple pages", (done) => {
  wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });
  vm.$nextTick(() => {
    vm.generateWarningsScreen();
    vm.changePage();
    expect(vm.page).toBe(2);
    done();
  });
});

test("changePage: switches away from the warnings screen when on the last page", (done) => {
  EventBus.off("warnings-complete");
  EventBus.on("warnings-complete", () => {
    expect(vm.page).toBe(0);
    done();
  });

  vm.changePage();
  vm.changePage();
});

test("cleanupHeadline: removes 'in effect' text", (done) => {
  expect(vm.cleanupHeadline(fakeWarning.headline)).toBe("weather warning");
  expect(vm.cleanupHeadline(fakeEndedWarning.headline)).toBe("weather warning ended");
  done();
});

test("truncateWarningDescription: removes redundant info", (done) => {
  expect(vm.truncateWarningDescription(fakeWarning.description)).toBe(fakeWarning.description);
  expect(vm.truncateWarningDescription(fakeEndedUrgentWarning.description)).toBe(fakeEndedUrgentWarning.description);
  expect(vm.truncateWarningDescription(fakeUrgentWarning.description)).toBe("stuff will happen");
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
