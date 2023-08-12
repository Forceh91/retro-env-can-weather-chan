import { useEffect, useRef, useState } from "react";

type PlaylistProps = {
  playlist: string[];
};

const PLAYLIST_CHECK_IS_PLAYING_TIMEOUT = 30 * 1000;

export function PlaylistComponent(props: PlaylistProps) {
  const { playlist } = props ?? {};
  const [selectedTrack, setSelectedTrack] = useState<string>();
  const audioPlayer = useRef();
  const audioPlayingChecker = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (!playlist?.length) return;

    // no track selected? choose a random one
    if (!selectedTrack?.length) selectRandomTrackFromPlaylist();
    else {
      const { current: audioPlayerElement }: { current: HTMLAudioElement } = audioPlayer;
      if (!audioPlayerElement) return;

      // since we have a selected track and an audio element, we can load the new source
      // and then set the volume to something a bit more reasonable
      audioPlayerElement.load();
      audioPlayerElement.volume = 0.4;
      audioPlayerElement.play();
    }

    // interval to make sure the track is playing if we dont have one
    if (!audioPlayingChecker.current)
      audioPlayingChecker.current = setInterval(() => checkAudioIsPlaying(), PLAYLIST_CHECK_IS_PLAYING_TIMEOUT);

    return () => {
      audioPlayingChecker.current && clearInterval(audioPlayingChecker.current);
    };
  }, [playlist, selectedTrack]);

  const selectRandomTrackFromPlaylist = (): void => {
    if (!playlist?.length) return;

    // pick a random track and try again if its missing for some reason
    const rand = Math.floor(1 + Math.random() * playlist.length) - 1;
    const track = playlist[rand];
    if (!track?.length) return selectRandomTrackFromPlaylist();

    // found one so set it
    setSelectedTrack(track);
  };

  const checkAudioIsPlaying = () => {
    const { current: audioPlayerElement }: { current: HTMLAudioElement } = audioPlayer;

    // if there's no selected track, or its paused, or there's no current time, select a new track
    if (!selectedTrack?.length || audioPlayerElement?.paused || !audioPlayerElement?.currentTime)
      selectRandomTrackFromPlaylist();
  };

  return (
    <>
      <audio
        id="playlist_audio"
        ref={audioPlayer}
        onEnded={selectRandomTrackFromPlaylist}
        onError={selectRandomTrackFromPlaylist}
        src={selectedTrack ?? ""}
        loop={false}
      />
    </>
  );
}
