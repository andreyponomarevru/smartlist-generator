import React from "react";
import {
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
} from "react-icons/io5";
import { useGlobalState } from "../../../hooks/use-global-state";

import "./controls.scss";

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Controls(props: ControlsProps) {
  const {
    player: {
      duration,
      handleNext,
      handlePrevious,
      progressBarRef,
      audioRef,
      setTimeProgress,
      isPlaying,
      togglePlayPause,
    },
  } = useGlobalState();

  // The requestAnimationFrame returns the request-id that we have assigned to playAnimationRef.current. The ref will preserve the returned ID over time. This ID lets us cancel the request once we pause the playback.
  const playAnimationRef = React.useRef<number>();

  const repeat = React.useCallback(() => {
    if (!progressBarRef.current) return;
    if (!audioRef.current) return;

    const currentTime = audioRef.current.currentTime;
    setTimeProgress(currentTime);
    progressBarRef.current.value = String(currentTime);
    progressBarRef.current.style.setProperty(
      "--range-progress",
      `${Number(progressBarRef.current.value) / duration}`
    );
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [audioRef, audioRef.current, progressBarRef]);

  React.useEffect(() => {
    if (isPlaying) audioRef.current?.play();
    else audioRef.current?.pause();
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [isPlaying, audioRef, repeat]);

  return (
    <div className={`controls ${props.className || ""}`}>
      <div>
        <button onClick={handlePrevious}>
          <IoPlaySkipBackSharp style={{ fill: "white" }} />
        </button>
      </div>
      <div>
        <button onClick={togglePlayPause} className="controls__artwork">
          {isPlaying ? (
            <IoPauseSharp style={{ fill: "white" }} />
          ) : (
            <IoPlaySharp style={{ fill: "white" }} />
          )}
        </button>
      </div>
      <div>
        <button onClick={handleNext}>
          <IoPlaySkipForwardSharp style={{ fill: "white" }} />
        </button>
      </div>
    </div>
  );
}
