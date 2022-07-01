import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import citystats from "../src/components/citystats";
import risesetdata from "./data/riseset";

enableAutoUnmount(afterEach);

let wrapper, vm;
const build = () => shallowMount(citystats, { props: { riseset: risesetdata } });

beforeEach(() => {
  wrapper = build();
  vm = wrapper.vm;
});

afterEach(() => {
  wrapper = null;
  vm = null;
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

  const stringE = vm.padString("-15", 6, true);
  expect(stringE).toBe("&nbsp;&nbsp;&nbsp;-15");

  const stringF = vm.padString("15", 6, true);
  expect(stringF).toBe("&nbsp;&nbsp;&nbsp;&nbsp;15");

  const stringG = vm.padString("5", 6, true);
  expect(stringG).toBe("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5");

  const stringH = vm.padString("15.5", 4, true);
  expect(stringH).toBe("15.5");

  done();
});

test("padString: pads strings correctly when a char is given", (done) => {
  const stringA = vm.padString("-15.5", 5, false, ".");
  expect(stringA).toBe("-15.5");

  const stringB = vm.padString("15.5", 5, false, ".");
  expect(stringB).toBe("15.5.");

  const stringC = vm.padString("5.5", 5, false, ".");
  expect(stringC).toBe("5.5..");

  const stringD = vm.padString("15.5", 4, false, ".");
  expect(stringD).toBe("15.5");

  const stringE = vm.padString("-15", 6, true, ".");
  expect(stringE).toBe("...-15");

  const stringF = vm.padString("15", 6, true, ".");
  expect(stringF).toBe("....15");

  const stringG = vm.padString("5", 6, true, ".");
  expect(stringG).toBe(".....5");

  const stringH = vm.padString("15.5", 4, true, ".");
  expect(stringH).toBe("15.5");

  done();
});

test("padString: doesn't error when no string is passed", (done) => {
  const stringA = vm.padString(null, 5);
  expect(stringA).toBe("");

  const stringB = vm.padString(undefined, 5);
  expect(stringB).toBe("");

  done();
});

test("sunriseset: is computed properly", (done) => {
  expect(vm.sunriseset).toBe(`Sunrise..6:53 AM Sunset..8:00 PM`);

  wrapper.setProps({ riseset: null });
  vm.$nextTick(() => {
    expect(vm.sunriseset).toBe("");
    done();
  });
});

test("pad: pads out numbers less than 10 with a 0", (done) => {
  const padA = vm.pad(8);
  expect(padA).toBe("08");

  const padB = vm.pad(11);
  expect(padB).toBe(11);

  done();
});

test("fillEllipsis: fills in ellipsis correctly", (done) => {
  wrapper.setProps({ hotcold: { hot: { city: "some place", province: "on" } } });
  vm.$nextTick(() => {
    const stringA = vm.fillEllipsis(vm.hotcold.hot);
    expect(stringA).toBe("...................");

    const stringB = vm.fillEllipsis();
    expect(stringB).toBe("...............................");

    const stringC = vm.fillEllipsis({ city: "another place", province: "on" });
    expect(stringC).toBe("................");
    done();
  });
});

test("titleString: is computed correctly", (done) => {
  wrapper.setProps({ city: "Winnipeg" });
  vm.$nextTick(() => {
    expect(vm.titleString).toContain("Winnipeg Statistics - ");
    done();
  });
});

test("hotColdTitleString: is computed correctly", (done) => {
  expect(vm.hotColdTitleString).toContain("Canadian Hot/Cold Spot ");
  done();
});

test("hotSpotString: is computed correctly", (done) => {
  wrapper.setProps({ hotcold: { hot: { city: "some place", province: "on", temp: "20" } } });
  vm.$nextTick(() => {
    expect(vm.hotSpotString).toStrictEqual(
      `${vm.hotcold.hot.city}, ${vm.hotcold.hot.province}&nbsp;...................&nbsp;${vm.hotcold.hot.temp}`
    );
    done();
  });
});

test("coldSpotString: is computed correctly", (done) => {
  expect(vm.coldSpotString).toStrictEqual(`N/A, N/A&nbsp;...............................N/A`);

  wrapper.setProps({ hotcold: { cold: { city: "another place", province: "on", temp: "-5" } } });
  vm.$nextTick(() => {
    expect(vm.coldSpotString).toStrictEqual(
      `${vm.hotcold.cold.city}, ${vm.hotcold.cold.province}&nbsp;................&nbsp;${vm.hotcold.cold.temp}`
    );
    done();
  });
});

test("precipTitle: is computed correctly", (done) => {
  expect(vm.precipTitle).toBe("Total Precipitation Since");

  wrapper.setProps({ isWinter: true });
  vm.$nextTick(() => {
    expect(vm.precipTitle).toBe("Total Snowfall Since");
    done();
  });
});

test("precipActual: is computed correctly", (done) => {
  wrapper.setProps({ seasonPrecip: { totalPrecip: 400.4 } });
  vm.$nextTick(() => {
    expect(vm.precipActual).toBe("April 1st ...........400.4 MM");

    wrapper.setProps({ isWinter: true });
    vm.$nextTick(() => {
      expect(vm.precipActual).toBe("October 1st .........400.4 MM");
      done();
    });
  });
});

test("precipNormal: is computed correctly", (done) => {
  wrapper.setProps({ seasonPrecip: { normalPrecip: 163.3 } });
  vm.$nextTick(() => {
    expect(vm.precipNormal).toBe("Normal ..............163.3 MM");
    done();
  });
});
