import { shallowMount } from "@vue/test-utils";
import Playlist from "../src/components/playlist";

const wrapper = shallowMount(Playlist, { props: {} });
const { vm } = wrapper;

test("setupPlaylist: doesn't do anything if there's no playlist", (done) => {
  const spy = jest.spyOn(vm, "selectRandomTrackFromPlaylist");
  vm.$nextTick(() => {
    vm.setupPlaylist();
    expect(spy).not.toHaveBeenCalled();
    done();
  });
});

test("setupPlaylist: it calls selectRandomTrackFromPlaylist because there's a list of tracks", (done) => {
  wrapper.setProps({ playlist: ["a.mp3", "b.mp3", "c.mp3"] });
  const spy = jest.spyOn(vm, "selectRandomTrackFromPlaylist");

  vm.$nextTick(() => {
    vm.setupPlaylist();
    expect(spy).toHaveBeenCalled();
    done();
  });
});

test("selectRandomTrackFromPlaylist: selects a random track after 1s", (done) => {
  jest.useFakeTimers();
  vm.selectRandomTrackFromPlaylist();

  jest.advanceTimersByTime(1000);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  expect(vm.currentTrack).not.toBe(null);
  done();
});

test("selectRandomTrackFromPlaylist: selects a random track after 1s", (done) => {
  wrapper.setProps({ playlist: [] });

  vm.$nextTick(() => {
    jest.useFakeTimers();
    vm.selectRandomTrackFromPlaylist();

    jest.advanceTimersByTime(1000);
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
    expect(vm.currentTrack).toBe(null);
    done();
  });
});
