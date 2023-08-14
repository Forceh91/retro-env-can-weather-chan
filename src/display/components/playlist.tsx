import { useEffect, useRef, useState } from "react";

type PlaylistProps = {
  playlist: string[];
};

export function PlaylistComponent(props: PlaylistProps) {
  const { playlist } = props ?? {};
  const [selectedTrack, setSelectedTrack] = useState<string>();
  const audioPlayer = useRef();

  useEffect(() => {
    // dont have a playlist so ignore
    if (!playlist?.length) return;

    // no track selected? choose a random one
    if (!selectedTrack?.length) selectRandomTrackFromPlaylist();
  }, [playlist]);

  const selectRandomTrackFromPlaylist = (): void => {
    if (!playlist?.length) return;

    // reset everything
    setSelectedTrack(null);

    // pick a random track and try again if its missing for some reason
    const rand = Math.floor(1 + Math.random() * playlist.length) - 1;
    const track = playlist[rand];
    if (!track?.length) return selectRandomTrackFromPlaylist();

    // wait 1s and then start playing again
    setTimeout(() => {
      setSelectedTrack(track);
    }, 1000);
  };

  return (
    <>
      {selectedTrack?.length && (
        <audio
          id="playlist_audio"
          ref={audioPlayer}
          onEnded={selectRandomTrackFromPlaylist}
          onError={selectRandomTrackFromPlaylist}
          src={selectedTrack ?? ""}
          loop={false}
          autoPlay={true}
        />
      )}
    </>
  );
}
