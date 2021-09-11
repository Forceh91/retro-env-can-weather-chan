import { shallowMount } from "@vue/test-utils";
import Crawler from "../src/components/crawler";

const wrapper = shallowMount(Crawler, { props: {} });
const { vm } = wrapper;

test("hasMessages: is computed properly", (done) => {
  expect(vm.hasMessages).toBe(0);
  done();
});

test("currentCrawlMessage: is computed properly", (done) => {
  expect(vm.currentCrawlMessage).toBe("");
  done();
});

test("hasMessages: is computed properly", (done) => {
  wrapper.setProps({ messages: ["a", "b"] });
  vm.$nextTick(() => {
    expect(vm.hasMessages).toBe(2);
    done();
  });
});

test("currentCrawlMessage: is computed properly", (done) => {
  expect(vm.currentCrawlMessage).toBe("a");
  done();
});

test("switchToNextCrawlMessage: switches message correctly, and loops back around", (done) => {
  vm.switchToNextCrawlMessage();
  expect(vm.crawlIx).toBe(1);

  vm.switchToNextCrawlMessage();
  expect(vm.crawlIx).toBe(0);

  done();
});

test("scrollMessage: scrolls the message once every 100ms", (done) => {
  vm.setupCrawler();

  const spy = jest.spyOn(vm, "scrollMessage");
  jest.useFakeTimers();
  vm.scrollMessage();

  jest.advanceTimersByTime(100);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
  expect(spy).toHaveBeenCalled();
  done();
});

test("scrollMessage: will move on if the message has passed", (done) => {
  const spy = jest.spyOn(vm, "switchToNextCrawlMessage");
  jest.useFakeTimers();

  // call this 10 times (message is 100px, and it moves 10px each call)
  for (let i = 0; i < 10; i++) {
    vm.scrollMessage();
    jest.advanceTimersByTime(100);
  }

  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 100);
  expect(spy).toHaveBeenCalled();
  done();
});
