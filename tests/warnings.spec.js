import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Warnings from "../src/components/warnings";

import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(Warnings, { global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

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

const reallyLongWarningDescription = {
  identifier: "e",
  references: "",
  expires: "2022-12-15T00:00:00",
  headline: "special weather statement",
  description:
    "Prolonged snow event over southeastern Saskatchewan and southern Manitoba beginning late Tuesday evening with some local areas receiving upwards of 20-30 cm by the weekend. The Colorado low has already begun to spread snow over southwestern Manitoba as of late Tuesday afternoon.  The area of snow will expand in coverage on Tuesday night with most areas seeing some accumulation by Wednesday morning.  With the above seasonable temperatures in place as the low pressure system approaches, the snow is expected to be a heavier wet snow. The worst conditions are expected to be in the communities along the international border.",
};

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

test("generateWarningsScreen: converts the warnings into a list if there is just one warning", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning] });
  vm.generateWarningsScreen();

  expect(vm.warningsUnavailable).toBe(false);
  expect(vm.warningsList.length).toBe(1);
  done();
});

test("generateWarningsScreen: copies warnings over correctly when there are multiple", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning] });

  vm.generateWarningsScreen();

  expect(vm.warningsUnavailable).toBe(false);
  expect(vm.warningsList.length).toBe(2);
  done();
});

test("generateWarningsScreen: generates the correct number of pages", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();
  expect(vm.pages).toBe(2);

  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();
  expect(vm.pages).toBe(3);
  done();
});

test("generateWarningsScreen: changes page after 30s", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();

  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateWarningsScreen();
  jest.advanceTimersByTime(30 * 1000);
  expect(spy).toHaveBeenCalled();
  expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 30 * 1000);
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

test("changePage: changes page correctly when there are multiple pages", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();

  vm.changePage();
  expect(vm.page).toBe(2);
  done();
});

test("changePage: switches away from the warnings screen when on the last page", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();

  EventBus.off("warnings-complete");
  EventBus.on("warnings-complete", () => {
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

test("truncateWarningDescription: splits correctly at the right point", async (done) => {
  expect(vm.truncateWarningDescription(reallyLongWarningDescription.description)).toStrictEqual(
    "Prolonged snow event over southeastern Saskatchewan and southern Manitoba beginning late Tuesday evening with some local areas receiving upwards of 20-30 cm by the weekend"
  );
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
