import { shallowMount } from "@vue/test-utils";
import { EventBus } from "../src/js/EventBus";
import Surrounding from "../src/components/surrounding";

const cityA = { city: "a", observation: { temp: 10, condition: "sunny" } };
const cityB = { city: "b", observation: { temp: 15, condition: "mostly cloudy" } };
const cityC = { city: "c", observation: { temp: 25, condition: "light rainshower" } };
const cityD = { city: "d", observation: { temp: 30, condition: "sunny" } };
const cityE = { city: "e", observation: { temp: 23, condition: "partly cloudy" } };
const cityF = { city: "f", observation: { temp: 12, condition: "thunderstorms" } };
const cityG = { city: "g", observation: { temp: 30, condition: "smoke" } };
const cityH = { city: "h", observation: { temp: 5, condition: "fog" } };
const cityI = { city: "i", observation: { temp: 17, condition: "drizzle" } };
const cityJ = { city: "j", observation: { temp: 22, condition: "mist" } };

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
  expect(vm.dateTime).toBe(`5 PM ${vm.timezone} Sep 05/21`);

  wrapper.setProps({ timezone: "CDT" });
  vm.$nextTick(() => {
    expect(vm.dateTime).toBe(`5 PM CDT Sep 05/21`);
    done();
  });
});

test("dateTime: is blank when theres no observed info", (done) => {
  wrapper.setProps({ observed: null });
  vm.$nextTick(() => {
    expect(vm.dateTime).toBe("");
    done();
  });
});

test("sortedObservations: sorts observations alphabetically", (done) => {
  expect(vm.sortedObservations).toStrictEqual([cityA, cityB, cityC]);

  wrapper.setProps({ observations: [cityB, cityA, cityC, cityA] });
  vm.$nextTick(() => {
    expect(vm.sortedObservations).toStrictEqual([cityA, cityA, cityB, cityC]);
    done();
  });
});

test("paginatedObservations: correctly paginates observations", (done) => {
  wrapper.setProps({ observations: [cityB, cityA, cityC, cityD, cityE, cityF, cityG, cityH, cityI, cityJ] });
  vm.$nextTick(() => {
    expect(vm.paginatedObservations).toStrictEqual([cityA, cityB, cityC, cityD, cityE, cityF, cityG]);

    vm.page += 1;
    expect(vm.paginatedObservations).toStrictEqual([cityH, cityI, cityJ]);
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
  wrapper.setProps({ observations: [cityB, cityA, cityC, cityD, cityE, cityF, cityG, cityH, cityI, cityJ] });

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

test("padTitle: makes sure a city name is always 11 characters + 3 padding spaces", (done) => {
  const paddingSpaces = "&nbsp;&nbsp;&nbsp;";
  const cityA = vm.padTitle("Winnipeg");
  expect(cityA).toBe("Winnipeg&nbsp;&nbsp;&nbsp;" + paddingSpaces);

  const cityB = vm.padTitle("Banff");
  expect(cityB).toBe("Banff&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + paddingSpaces);

  const cityC = vm.padTitle("Niagra Falls");
  expect(cityC).toBe("Niagra Fall" + paddingSpaces);
  done();
});

test("trimCondition: makes sure condition string is only 13 characters", (done) => {
  const conditionA = vm.trimCondition("sunny");
  expect(conditionA).toBe("sunny");

  const conditionB = vm.trimCondition("mostly cloudy");
  expect(conditionB).toBe("mostly cloudy");

  const conditionC = vm.trimCondition("thunderstorm with light rainshower");
  expect(conditionC).toBe("thunderstorm ");

  done();
});

test("trimCondition: replaces 'shower' with a blank string", (done) => {
  const conditionA = vm.trimCondition("sunny");
  expect(conditionA).toBe("sunny");

  const conditionB = vm.trimCondition("light rainshower");
  expect(conditionB).toBe("light rain");

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

test("destroyed: removes page change interval", (done) => {
  wrapper.unmount();
  expect(clearInterval).toHaveBeenCalled();
  done();
});
