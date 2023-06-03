import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Warnings, { PAGE_CHANGE_FREQUENCY } from "../src/components/warnings";

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
  description: "stuff will happen Locations impacted: some location here\n\n### when warning appears, run",
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
    "Prolonged snow event over southeastern Saskatchewan and southern Manitoba beginning late Tuesday evening with some local areas receiving upwards of 20-30 cm by the weekend.  The Colorado low has already begun to spread snow over southwestern Manitoba as of late Tuesday afternoon.  The area of snow will expand in coverage on Tuesday night with most areas seeing some accumulation by Wednesday morning.  With the above seasonable temperatures in place as the low pressure system approaches, the snow is expected to be a heavier wet snow. The worst conditions are expected to be in the communities along the international border.  As the area of low pressure moves through the Midwestern states towards the Great Lakes on Wednesday night and into Thursday, a hang back area of snowfall is expected to linger over southeastern Saskatchewan and southern Manitoba through the week. At this time, it appears that for each forecast period, snowfall amounts are expected to stay sub-warning. However, with the snow beginning overnight on Tuesday and continuing through the week, the accumulation of snow over such a prolonged time will have continuous impact over the region. The accumulations will range from 10-20 cm, with some local amounts reaching as high as 30 cm by the weekend.",
};

const anotherReallyLongWarningDescription = {
  identifier: "e",
  references: "",
  expires: "2022-12-15T00:00:00",
  headline: "special weather statement",
  description:
    "As of Wednesday afternoon, the first two rounds of snow have given widespread snowfall amounts of 10 to 15 cm across southern Manitoba, with localized higher amounts.  Only light snow is expected over southeastern Manitoba on Wednesday night ahead of another band of heavier snow expected on Thursday.  Additionally, some freezing drizzle may be mixed in at times.  Over western Manitoba and eastern Saskatchewan, snowfall amounts will be in the 5 to 10 cm range tonight.",
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

test("generateWarningsScreen: changes page after PAGE_CHANGE_FREQUENCY seconds", async (done) => {
  await wrapper.setProps({ warnings: [fakeWarning, fakeWarning, fakeWarning] });
  vm.generateWarningsScreen();

  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateWarningsScreen();
  jest.advanceTimersByTime(PAGE_CHANGE_FREQUENCY);
  expect(spy).toHaveBeenCalled();
  expect(setInterval).toHaveBeenCalledWith(expect.any(Function), PAGE_CHANGE_FREQUENCY);
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
    "Prolonged snow event over southeastern Saskatchewan and southern Manitoba beginning late Tuesday evening with some local areas receiving upwards of 20-30 cm by the weekend. The Colorado low has already begun to spread snow over southwestern Manitoba as of late Tuesday afternoon"
  );
  expect(vm.truncateWarningDescription(anotherReallyLongWarningDescription.description)).toStrictEqual(
    "As of Wednesday afternoon, the first two rounds of snow have given widespread snowfall amounts of 10 to 15 cm across southern Manitoba, with localized higher amounts. Only light snow is expected over southeastern Manitoba on Wednesday night ahead of another band of heavier snow expected on Thursday"
  );
  done();
});

test("warningShouldFlash: correctly identifies whether the title should flash", (done) => {
  expect(vm.warningShouldFlash()).toBe(false);
  expect(vm.warningShouldFlash({ severity: "unknown" })).toBe(false);
  expect(vm.warningShouldFlash({ severity: "minor" })).toBe(false);
  expect(vm.warningShouldFlash({ severity: "moderate" })).toBe(true);
  expect(vm.warningShouldFlash({ severity: "severe" })).toBe(true);
  expect(vm.warningShouldFlash({ severity: "extreme" })).toBe(true);
  expect(vm.warningShouldFlash({ severity: "moderate", headline: "air quality statement" })).toBe(false);
  expect(vm.warningShouldFlash({ severity: "moderate", headline: "special weather advisory" })).toBe(false);
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
