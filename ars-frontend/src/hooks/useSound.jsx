import { useEffect, useRef } from "react";
import { useSoundSettings } from "../context/SoundContext";

export default function useSound(src, volume = 0.35) {
  const { enabled } = useSoundSettings();
  const audioRef = useRef(null);

  useEffect(() => {
    const a = new Audio(src);
    a.volume = volume;
    a.preload = "auto";
    audioRef.current = a;
  }, [src, volume]);

  const play = () => {
    if (!enabled) return;
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play().catch(() => {
      // browser may block until user interaction; safe to ignore
    });
  };

  return play;
}