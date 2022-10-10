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

test("generateForecastPages: sets the page to 0 and changes page after 50s if it was a reload", (done) => {
  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateForecastPages(true);
  expect(vm.page).toBe(0);
  jest.advanceTimersByTime(50 * 1000);
  expect(spy).toHaveBeenCalled();
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 50 * 1000);

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

test("truncateForecastText: truncates forecasts properly", (done) => {
  expect(vm.truncateForecastText("")).toStrictEqual("");
  expect(vm.truncateForecastText("high plus 4")).toStrictEqual("high 4");
  expect(vm.truncateForecastText("high plus 12")).toStrictEqual("high 12");
  expect(vm.truncateForecastText("high zero")).toStrictEqual("high 0");
  expect(vm.truncateForecastText("low minus 6")).toStrictEqual("low -6");
  expect(vm.truncateForecastText("low minus 16")).toStrictEqual("low -16");
  expect(vm.truncateForecastText("low minus 24")).toStrictEqual("low -24");
  expect(vm.truncateForecastText("low zero")).toStrictEqual("low 0");
  expect(vm.truncateForecastText("wind northeast 20km/h")).toStrictEqual("wind northeast 20kmh");
  expect(vm.truncateForecastText("40 percent chance of showers")).toStrictEqual("40% chance of showers");
  expect(vm.truncateForecastText("100 percent chance of flurries")).toStrictEqual("100% chance of flurries");
  expect(vm.truncateForecastText("5 percent chance of flurries")).toStrictEqual("5% chance of flurries");
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  expect(clearTimeout).toHaveBeenCalled();
  done();
});
