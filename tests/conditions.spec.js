import { shallowMount } from "@vue/test-utils";
import Conditions from "../src/components/conditions";
import data from "./data/conditions";

const wrapper = shallowMount(Conditions, {
  props: { city: "Winnipeg", observed: "2021-09-07T21:00:00.000Z", conditions: { ...data.current } },
});
const { vm } = wrapper;

test("titleString: is computed properly", (done) => {
  expect(vm.titleString).toContain(`&nbsp;Winnipeg&nbsp;&nbsp;&nbsp;`);
  expect(vm.titleString).toContain(`${vm.conditions.dateTime[1].zone}&nbsp;Sep 07/21`);
  done();
});

test("observedFormatted: is computed properly", (done) => {
  expect(vm.observedFormatted).toContain(`${vm.conditions.dateTime[1].zone}&nbsp;Sep 07/21`);
  done();
});

test("currentCondition: is computed properly", (done) => {
  expect(vm.currentCondition).toBe("Partly Cloudy");

  vm.conditions.condition = "Thunderstorms with heavy rain shower";
  expect(vm.currentCondition).toBe("Thunderstorms");

  vm.conditions.condition = "snow and freezing rain";
  expect(vm.currentCondition).toBe("snow");

  vm.conditions.condition = "light rainshower";
  expect(vm.currentCondition).toBe("light rainshower");

  vm.conditions.condition = "freezing rain";
  expect(vm.currentCondition).toBe("freezing rain");
  done();
});

test("temperature: is computed properly", (done) => {
  const oldTempValue = Object.assign({}, vm.conditions.temperature);
  expect(vm.temperature).toBe("23 C");

  vm.conditions.temperature.value = 0.3;
  expect(vm.temperature).toBe("0 C");

  vm.conditions.temperature.value = 0.6;
  expect(vm.temperature).toBe("1 C");

  vm.conditions.temperature.value = -0.4;
  expect(vm.temperature).toBe("0 C");

  vm.conditions.temperature.value = -11.4;
  expect(vm.temperature).toBe("-11 C");

  vm.conditions.temperature.value = oldTempValue.value;

  vm.conditions.temperature = null;
  expect(vm.temperature).toBe("N/A ");

  done();
});

test("wind: is computed properly", (done) => {
  expect(vm.wind).toBe("&nbsp;NW&nbsp;&nbsp;45 km/h");

  const oldSpeed = { ...vm.conditions.wind.speed };
  vm.conditions.wind.speed.value = null;
  expect(vm.wind).toBe("&nbsp;NW&nbsp;&nbsp; km/h");
  vm.conditions.wind.speed = oldSpeed;

  vm.conditions.wind = null;
  expect(vm.wind).toBe("");

  wrapper.setProps({ conditions: data.current });
  vm.$nextTick(() => {
    done();
  });
});

test("humidity: is computed correctly", (done) => {
  expect(vm.humidity).toBe("36 %");

  vm.conditions.relativeHumidity = null;
  expect(vm.humidity).toBe("");
  done();
});

test("visibility: is computed correctly", (done) => {
  expect(vm.visibility).toBe("24 km");

  vm.conditions.visibility = null;
  expect(vm.visibility).toBe("");

  done();
});

test("pressure: is computed correctly", (done) => {
  expect(vm.pressure).toBe("100.8 kPa&nbsp;&nbsp;falling");

  vm.conditions.pressure = undefined;
  expect(vm.pressure).toBe("");

  done();
});

test("windchill: is computed correctly", (done) => {
  expect(vm.windchill).toBe(0);

  vm.conditions.temperature.value = -5;
  expect(vm.windchill).toBe(1470);

  done();
});

test("shouldShowWindchill: is computed correctly", (done) => {
  expect(vm.shouldShowWindchill).toBe(true);

  vm.conditions.temperature.value = 1;
  expect(vm.shouldShowWindchill).toBe(false);

  done();
});

test("padString: pads strings correctly", (done) => {
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
