import { shallowMount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Surrounding from "../src/components/surrounding";

const cityA = { name: "a", observation: { temp: 10, condition: "sunny" } };
const cityB = { name: "b", observation: { temp: 15, condition: "mostly cloudy" } };
const cityC = { name: "c", observation: { temp: 25, condition: "light rainshower" } };
const cityD = { name: "d", observation: { temp: 30, condition: "sunny" } };
const cityE = { name: "e", observation: { temp: 23, condition: "partly cloudy" } };
const cityF = { name: "f", observation: { temp: 12, condition: "thunderstorms" } };
const cityG = { name: "g", observation: { temp: 30, condition: "smoke" } };
const cityH = { name: "h", observation: { temp: 5, condition: "fog" } };
const cityI = { name: "i", observation: { temp: 17, condition: "drizzle" } };
const cityJ = { name: "j", observation: { temp: 22, condition: "mist" } };
const cityK = { name: "k", observation: { temp: 11, condition: "mist" } };
const cityL = { name: "l", observation: { temp: 12, condition: "mist" } };
const cityM = { name: "m", observation: { temp: 13, condition: "mist" } };

const wrapper = shallowMount(Surrounding, {
  props: { observed: "2021-09-05T21:00:00.000Z", timezone: "EDT" },
});
const { vm } = wrapper;

test("observationsUnavailable: correctly computes based on observations", (done) => {
  expect(vm.observationsUnavailable).toBe(true);

  wrapper.setProps({ observations: [cityB, cityA, cityC] });
  vm.$nextTick(() => {
    expect(vm.observationsUnavailable).toBe(false);
  });
  done();
});

test("dateTime: correctly produces the date/time string with filled in timezone", (done) => {
  expect(vm.dateTime).toContain(`${vm.timezone}&nbsp;&nbsp;Sep 05/21`);

  wrapper.setProps({ timezone: "CDT" });
  vm.$nextTick(() => {
    expect(vm.dateTime).toContain(`CDT&nbsp;&nbsp;Sep 05/21`);
    done();
  });
});

test("dateTime: is a padded blank string when theres no observed info", (done) => {
  wrapper.setProps({ observed: null });
  vm.$nextTick(() => {
    expect(vm.dateTime).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    done();
  });
});

test("paginatedObservations: correctly paginates observations", (done) => {
  wrapper.setProps({
    observations: [cityB, cityA, cityC, cityD, cityE, cityF, cityG, cityH, cityI, cityJ, cityK, cityL, cityM],
  });
  vm.$nextTick(() => {
    expect(vm.paginatedObservations).toStrictEqual([cityB, cityA, cityC, cityD, cityE, cityF, cityG]);

    vm.page += 1;
    expect(vm.paginatedObservations).toStrictEqual([cityH, cityI, cityJ, cityK, cityL, cityM]);
    done();
  });
});

test("generateObservationsScreen: correctly generates the page count", (done) => {
  vm.generateObservationsScreen();
  expect(vm.pages).toBe(2);

  wrapper.setProps({ observations: [cityB, cityA, cityC] });
  vm.$nextTick(() => {
    vm.generateObservationsScreen();
    expect(vm.pages).toBe(1);

    done();
  });
});

test("generateObservationsScreen: changes page after 15s", (done) => {
  wrapper.setProps({
    observations: [cityB, cityA, cityC, cityD, cityE, cityF, cityG, cityH, cityI, cityJ, cityK, cityL, cityM],
  });

  jest.useFakeTimers();
  const spy = jest.spyOn(vm, "changePage");

  vm.generateObservationsScreen();
  jest.advanceTimersByTime(15 * 1000);
  expect(spy).toHaveBeenCalled();
  expect(setInterval).toHaveBeenLastCalledWith(expect.any(Function), 15 * 1000);
  done();
});

test("changePage: changes page correctly", (done) => {
  vm.generateObservationsScreen();
  vm.changePage();
  expect(vm.page).toBe(2);
  done();
});

test("changePage: navigates away if its the last page", (done) => {
  EventBus.off("observation-complete");
  EventBus.on("observation-complete", () => {
    expect(vm.page).toBe(0);
    done();
  });

  vm.changePage();
});

test("padTitle: makes sure a city name is always 13 characters", (done) => {
  const cityA = vm.padTitle("Winnipeg");
  expect(cityA).toBe("Winnipeg&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

  const cityB = vm.padTitle("Banff");
  expect(cityB).toBe("Banff&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

  const cityC = vm.padTitle("Niagra Falls");
  expect(cityC).toBe("Niagra Falls&nbsp;");
  done();
});

test("trimCondition: makes sure condition string is only 16 characters", (done) => {
  const conditionA = vm.trimCondition("sunny");
  expect(conditionA).toBe("sunny");

  const conditionB = vm.trimCondition("mostly cloudy");
  expect(conditionB).toBe("mostly cloudy");

  const conditionC = vm.trimCondition("thunderstorm with light rainshower");
  expect(conditionC).toBe("thunderstorm");

  done();
});

test("trimCondition: replaces 'shower' with a blank string", (done) => {
  const conditionA = vm.trimCondition("sunny");
  expect(conditionA).toBe("sunny");

  const conditionB = vm.trimCondition("light rainshower");
  expect(conditionB).toBe("light rainshower");

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

test("padString: doesn't error when no string is passed", (done) => {
  const stringA = vm.padString(null, 5);
  expect(stringA).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

  const stringB = vm.padString("", 5);
  expect(stringB).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");

  done();
});

test("padString: handles a 0 value correctly", (done) => {
  const stringA = vm.padString(0, 5);
  expect(stringA).toBe("0&nbsp;&nbsp;&nbsp;&nbsp;");
  done();
});

test("roundTemp: handles a NaN correctly", (done) => {
  expect(vm.roundTemp()).toBe("");
  expect(vm.roundTemp(NaN)).toBe("");
  done();
});

test("roundTemp: handles a normal number correctly", (done) => {
  expect(vm.roundTemp(1.1)).toBe(1);
  expect(vm.roundTemp(3.5)).toBe(4);
  expect(vm.roundTemp(16.7)).toBe(17);
  expect(vm.roundTemp(-1.4)).toBe(-1);
  done();
});

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
