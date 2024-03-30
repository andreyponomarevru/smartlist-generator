import React from "react";
import { IoPauseSharp } from "react-icons/io5";
import { useGlobalState } from "../../../hooks/use-global-state";
import { FaPlay } from "react-icons/fa";

import "./controls.scss";

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Controls(props: ControlsProps) {
  const {
    player: {
      duration,
      progressBarRef,
      audioRef,
      setTimeProgress,
      isPlaying,
      activeTrack,
      togglePlay,
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
      `${Number(progressBarRef.current.value) / duration}`,
    );
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [duration, audioRef, progressBarRef, setTimeProgress]);

  React.useEffect(() => {
    if (isPlaying)
      audioRef.current
        ?.play()
        .catch(() => console.error("Audio src is unavailable"));
    else audioRef.current?.pause();
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [isPlaying, audioRef, repeat]);

  return (
    <div className={`controls ${props.className || ""}`}>
      <button
        type="button"
        onClick={() => togglePlay(!isPlaying)}
        className="btn btn_type_icon btn_hover_grey-20"
      >
        {activeTrack ? (
          isPlaying ? (
            <IoPauseSharp className="icon" />
          ) : (
            <FaPlay className="icon" />
          )
        ) : (
          ""
        )}
      </button>
    </div>
  );
}
