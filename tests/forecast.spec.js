import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import { getFreshStore } from "./build";
import ecdata from "./data/ecdata";
import ecForecast from "./data/forecast";

import forecast from "../src/components/forecast";
import { EventBus } from "../src/js/EventBus";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(forecast, { global: { plugins: [getFreshStore(ecdata)] } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
});

test("forecastUnavailable: computes correctly", (done) => {
  expect(vm.forecastUnavailable).toBe(true);

  wrapper.setProps({ forecast: ecForecast });
  vm.$nextTick(() => {
    expect(vm.forecastUnavailable).toBe(false);
    done();
  });
});

test("generateForecastPages: sets the page to 0 and changes page after 15s", (done) => {
  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateForecastPages();
  expect(vm.page).toBe(0);
  jest.advanceTimersByTime(15 * 1000);
  expect(spy).toHaveBeenCalled();
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 15 * 1000);

  done();
});

test("changePage: moves the 'page' forward by 2 if we're not on the first page", (done) => {
  wrapper.setProps({ forecast: ecForecast });
  vm.$nextTick(() => {
    vm.page = 1;
    vm.changePage();
    expect(vm.page).toBe(3);
    done();
  });
});

test("changePage: switches away from the forecast screen on the last page", (done) => {
  EventBus.off("forecast-complete");
  EventBus.on("forecast-complete", () => {
    expect(vm.page).toBe(0);
    done();
  });

  wrapper.setProps({ forecast: ecForecast });
  vm.$nextTick(() => {
    vm.page = 3;
    vm.changePage();
    vm.changePage();
  });
});

test("prettifyForecastDay: returns 'tonight' correctly", (done) => {
  expect(vm.prettifyForecastDay("Saturday Night")).toBe("Tonight");
  expect(vm.prettifyForecastDay("Saturday")).toBe("Today");
  expect(vm.prettifyForecastDay("")).toBe("Today");
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
