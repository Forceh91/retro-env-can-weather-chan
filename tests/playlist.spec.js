import { shallowMount } from "@vue/test-utils";
import Playlist from "../src/components/playlist";

const wrapper = shallowMount(Playlist, { props: {} });
const { vm } = wrapper;

test("setupPlaylist: doesn't call selectRandomTrackFromPlaylist since the playlist is empty", (done) => {
  const spy = jest.spyOn(vm, "selectRandomTrackFromPlaylist");

  vm.setupPlaylist();
  expect(spy).not.toHaveBeenCalled();
  wrapper.setProps({ playlist: ["a.mp3", "b.mp3", "c.mp3"] });

  vm.$nextTick(() => {
    done();
  });
});

test("setupPlaylist: does select a random track if a playlist exists", (done) => {
  const spy = jest.spyOn(vm, "selectRandomTrackFromPlaylist");

  vm.setupPlaylist();
  expect(spy).toHaveBeenCalled();
  done();
});

test("selectRandomTrackFromPlaylist: changes track after a second", (done) => {
  jest.useFakeTimers();
  vm.selectRandomTrackFromPlaylist();
  expect(vm.currentTrack).toBe(null);

  jest.advanceTimersByTime(1000);
  expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 1000);
  expect(vm.currentTrack).not.toBe(null);
  done();
});

test("selectRandomTrackFromPlaylist: tries again if it can't select a track", (done) => {
  wrapper.setProps({ playlist: [] });
  const spy = jest.spyOn(vm, "selectRandomTrackFromPlaylist");

  vm.$nextTick(() => {
    jest.useFakeTimers();
    vm.selectRandomTrackFromPlaylist();

    jest.advanceTimersByTime(1000);
    expect(spy).toHaveBeenCalled();
    done();
  });
});
