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
    let time = "2022-09-16T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/Sep. \d{2}&nbsp;&nbsp;/);

    time = "2022-12-09T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/Dec. \d&nbsp;&nbsp;&nbsp;|Dec. \d{2}&nbsp;&nbsp;/);

    time = "2022-03-12T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/March \d{2}&nbsp;/);

    time = "2022-04-04T14:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/April \d&nbsp;&nbsp;/);

    time = "2023-02-02T11:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/Feb. \d&nbsp;&nbsp;&nbsp;/);

    time = "2023-02-02T17:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/Feb. \d&nbsp;&nbsp;&nbsp;/);

    time = "2023-02-02T19:00:00.000Z";
    vm.$store.commit("setObservedStationTime", time);
    expect(vm.dateString).toMatch(/Feb. \d&nbsp;&nbsp;&nbsp;/);
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
    expect(vm.padTemp(10)).toBe("10");
    for (let i = 0; i < 10; i++) {
      expect(vm.padTemp(i)).toBe(`0${i}`);
    }

    done();
  });

  it("truncateForecastCondition: removes 'then' from the forecast", (done) => {
    expect(vm.truncateForecastCondition("Cloud then Rain")).not.toContain(" then ");
    done();
  });

  it("truncateForecastCondition: handles some long forecast conditions", (done) => {
    expect(vm.truncateForecastCondition("Isolated Rain Showers then Partly Sunny")).toStrictEqual("isld showers&nbsp;");
    expect(vm.truncateForecastCondition("Slight Chance Showers And Thunderstorms")).toStrictEqual("chnc showers&nbsp;");
    expect(vm.truncateForecastCondition("Chance Showers And Thunderstorms")).toStrictEqual("chnc showers&nbsp;");
    expect(vm.truncateForecastCondition("Slight Chance Rain Showers")).toStrictEqual("chnc showers&nbsp;");
    expect(vm.truncateForecastCondition("Slight Chance Rain")).toStrictEqual("chnc rain&nbsp;&nbsp;&nbsp;&nbsp;");
    expect(vm.truncateForecastCondition("Scattered Rain Showers")).toStrictEqual("sctd showers&nbsp;");
    expect(vm.truncateForecastCondition("Areas of Fog then Mostly Sunny")).toBe("areas of fog&nbsp;");
    expect(vm.truncateForecastCondition("Patchy Fog then some")).toBe("patchy fog&nbsp;&nbsp;&nbsp;");
    expect(vm.truncateForecastCondition("Patchy Fog")).toBe("patchy fog&nbsp;&nbsp;&nbsp;");
    expect(vm.truncateForecastCondition("Scattered Showers And Thunderstorms")).toBe("sctd showers&nbsp;");
    expect(vm.truncateForecastCondition("Mostly Cloudy")).toBe("mostly cldy&nbsp;&nbsp;");
    done();
  });
});
