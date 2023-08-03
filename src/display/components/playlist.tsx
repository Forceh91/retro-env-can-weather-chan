import { useEffect, useRef, useState } from "react";

type PlaylistProps = {
  playlist: string[];
};

const BASE_URL = `http://${window.location.hostname}`;
const BASE_PORT = window.location.port;
const MUSIC_URL = `${BASE_URL}:${BASE_PORT}`;

export function PlaylistComponent(props: PlaylistProps) {
  const { playlist } = props ?? {};
  const [selectedTrack, setSelectedTrack] = useState<string>();
  const audioPlayer = useRef();

  useEffect(() => {
    if (!playlist?.length) return;

    if (!selectedTrack?.length) selectRandomTrackFromPlaylist();
    else {
      const { current: audioPlayerElement }: { current: HTMLAudioElement } = audioPlayer;
      if (!audioPlayerElement) return;

      // since we have a selected track and an audio element, we can load the new source
      // and then set the volume to something a bit more reasonable
      audioPlayerElement.load();
      audioPlayerElement.volume = 0.33;
    }
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

  return (
    <>
      <audio
        id="playlist_audio"
        ref={audioPlayer}
        autoPlay
        onEnded={selectRandomTrackFromPlaylist}
        onError={selectRandomTrackFromPlaylist}
        src={selectedTrack ?? ""}
      />
    </>
  );
}
