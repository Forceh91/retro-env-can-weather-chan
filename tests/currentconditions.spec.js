import { shallowMount } from "@vue/test-utils";
import CurrentConditions from "../src/components/currentconditions";
import risesetdata from "./data/riseset";

const wrapper = shallowMount(CurrentConditions, { props: { riseset: risesetdata } });
const { vm } = wrapper;

test("sunriseset: is computed properly", (done) => {
  expect(vm.sunriseset).toBe(`Sunrise..06:53 AM Sunset..08:00 PM`);

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
