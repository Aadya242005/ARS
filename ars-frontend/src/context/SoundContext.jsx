import { createContext, useContext, useEffect, useRef, useState } from "react";
import introMp3 from "../assets/click.mp3";

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(introMp3);
    audio.volume = 0.5;
    audio.loop = true; // Loop the background track
    audio.preload = "auto";
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;

    if (enabled) {
      audioRef.current.play().catch(() => {
        // If autoplay gets blocked, revert to false
        setEnabled(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [enabled]);

  // Remove the old logic that resets and restarts the background track on every click
  const play = () => {};

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

// simple button wrapper
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