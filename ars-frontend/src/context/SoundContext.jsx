import { createContext, useContext, useEffect, useRef, useState } from "react";
import introMp3 from "../assets/click.mp3";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(true);
  const audioRef = useRef(null);
  const played = useRef(false);

  useEffect(() => {
    const audio = new Audio(introMp3);
    audio.volume = 0.6;
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    if (played.current) return;

    const tryPlay = async () => {
      try {
        await audioRef.current.play();
        played.current = true;

        setTimeout(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }, 15000);
      } catch {
        // autoplay blocked → play on first click
        const playOnClick = async () => {
          try {
            await audioRef.current.play();
            played.current = true;

            setTimeout(() => {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }, 15000);
          } catch {}
        };

        window.addEventListener("pointerdown", playOnClick, { once: true });
      }
    };

    tryPlay();
  }, [enabled]);

  // helper to play the click sound any time the user requests it
  const play = () => {
    if (!enabled || !audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return (
    <SoundContext.Provider
      value={{
        enabled,
        toggle: () => setEnabled((v) => !v),
        play,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}

export function useSoundSettings() {
  return useContext(SoundContext);
}

// simple button wrapper – plays click sound when enabled
export function SoundButton({ children, onClick, className, ...props }) {
  const { enabled, play } = useContext(SoundContext);

  const handleClick = (e) => {
    if (enabled) play();
    if (onClick) onClick(e);
  };

  return (
    <button
      {...props}
      className={className}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

// default export keeps existing import in Home.jsx working
export default SoundButton;