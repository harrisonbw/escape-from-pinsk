import { useCallback, useState } from "react";
import {
  isMusicMuted,
  isMusicStarted,
  setMusicMuted,
  startMusic,
} from "../audio/music";

export function MusicToggle() {
  const [muted, setMuted] = useState(() => isMusicMuted());
  const [on, setOn] = useState(() => isMusicStarted());

  const toggle = useCallback(async () => {
    if (!isMusicStarted()) {
      await startMusic();
      setOn(true);
      if (muted) {
        setMusicMuted(false);
        setMuted(false);
      }
      return;
    }
    const next = !muted;
    setMusicMuted(next);
    setMuted(next);
  }, [muted]);

  return (
    <button
      type="button"
      className={"music-toggle" + (muted || !on ? " music-toggle--off" : "")}
      onClick={toggle}
      aria-label={muted || !on ? "Unmute music" : "Mute music"}
      title={muted || !on ? "Music off — click for 8-bit Hava Nagila" : "Mute music"}
    >
      {muted || !on ? "♪ OFF" : "♪ ON"}
    </button>
  );
}
