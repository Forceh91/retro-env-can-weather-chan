import { shallowMount, enableAutoUnmount } from "@vue/test-utils";
import sunspots from "../src/components/sunspots";
import sunspotForecast from "./data/sunspotsdata";

import { getFreshStore } from "./build";
import { EventBus } from "../src/js/EventBus";
import ecdata from "./data/ecdata";

describe("sunspots.vue", () => {
  enableAutoUnmount(afterEach);

  let wrapper, vm;
  const build = () =>
    shallowMount(sunspots, { global: { plugins: [getFreshStore(ecdata)] }, props: { sunspotForecast } });

  beforeEach(() => {
    wrapper = build();
    vm = wrapper.vm;
  });

  afterEach(() => {
    wrapper = null;
    vm = null;
  });

  it("availableStations: only shows sunspots with data", (done) => {
    expect(vm.availableStations.length).toBe(5);
    done();
  });

  it("sunspotForecastUnavailable: correctly identifies that no data is available", async (done) => {
    expect(vm.sunspotForecastUnavailable).toBe(false);

    await wrapper.setProps({ sunspotForecast: null });
    expect(vm.sunspotForecastUnavailable).toBeTruthy();

    await wrapper.setProps({ sunspotForecast: [] });
    expect(vm.sunspotForecastUnavailable).toBeTruthy();

    await wrapper.setProps({ sunspotForecast: [...sunspotForecast.slice(0, 1)] });
    expect(vm.sunspotForecastUnavailable).toBeTruthy();

    done();
  });

  it("dateString: prints the month/day correctly", (done) => {
    expect(vm.dateString).toStrictEqual("Sep. 16&nbsp;&nbsp;");

    let time = "2022-12-09T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toStrictEqual("Dec. 9&nbsp;&nbsp;&nbsp;");

    time = "2022-03-12T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toStrictEqual("March 12&nbsp;");

    time = "2022-04-04T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toStrictEqual("April 4&nbsp;&nbsp;");
    done();
  });

  it("checkSunspotForecastIsAvailable: emits correctly if unavailable", async (done) => {
    const spy = jest.spyOn(EventBus, "emit");
    vm.checkSunspotForecastIsAvailable();
    expect(spy).not.toHaveBeenCalled();

    await wrapper.setProps({ sunspotForecast: null });
    vm.checkSunspotForecastIsAvailable();
    expect(spy).toHaveBeenCalled();

    await wrapper.setProps({ sunspotForecast: [] });
    vm.checkSunspotForecastIsAvailable();
    expect(spy).toHaveBeenCalled();

    await wrapper.setProps({ sunspotForecast: [...sunspotForecast.slice(0, 1)] });
    vm.checkSunspotForecastIsAvailable();
    expect(spy).toHaveBeenCalled();
    done();
  });

  it("padCityName: makes sure a city is 13 chars long", (done) => {
    expect(vm.padCityName("Key West")).toStrictEqual("Key West&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    expect(vm.padCityName("Orlando")).toStrictEqual("Orlando&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
    expect(vm.padCityName("Brownsville")).toStrictEqual("Brownsville&nbsp;&nbsp;");
    done();
  });

  it("padLoTemp: makes sure temps less than 10 are 0x", (done) => {
    expect(vm.padLoTemp(10)).toBe("10");
    for (let i = 0; i < 10; i++) {
      expect(vm.padLoTemp(i)).toBe(`0${i}`);
    }

    done();
  });

  it("truncateForecastCondition: removes 'then' from the forecast", (done) => {
    expect(vm.truncateForecastCondition("Cloud then Rain")).not.toContain(" then ");
    done();
  });
});
