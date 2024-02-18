import React from "react";
import {
  IoPlaySkipBackSharp,
  IoPlaySkipForwardSharp,
  IoPlaySharp,
  IoPauseSharp,
} from "react-icons/io5";

import { TrackMeta } from "../../types";

import "./controls.scss";

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  progressBarRef: React.MutableRefObject<HTMLInputElement | null>;
  duration: number;
  setTimeProgress: (time: number) => void;
  setPlayingTrackIndex: (
    value: React.SetStateAction<{
      groupId: number;
      index: number;
    } | null>
  ) => void;
  handleNext(): void;
  handlePrevious(): void;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  togglePlayPause: () => void;
}

export function Controls(props: ControlsProps) {
  // The requestAnimationFrame returns the request-id that we have assigned to playAnimationRef.current. The ref will preserve the returned ID over time. This ID lets us cancel the request once we pause the playback.
  const playAnimationRef = React.useRef<number>();

  const repeat = React.useCallback(() => {
    if (!props.progressBarRef.current) return;
    if (!props.audioRef.current) return;

    const currentTime = props.audioRef.current.currentTime;
    props.setTimeProgress(currentTime);
    props.progressBarRef.current.value = String(currentTime);
    props.progressBarRef.current.style.setProperty(
      "--range-progress",
      `${Number(props.progressBarRef.current.value) / props.duration}`
    );
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [props.audioRef, props.audioRef.current, props.progressBarRef]);

  React.useEffect(() => {
    if (props.isPlaying) props.audioRef.current?.play();
    else props.audioRef.current?.pause();
    playAnimationRef.current = requestAnimationFrame(repeat);
  }, [props.isPlaying, props.audioRef, repeat]);

  return (
    <div className={`controls ${props.className || ""}`}>
      <div>
        <button onClick={props.handlePrevious}>
          <IoPlaySkipBackSharp style={{ fill: "white" }} />
        </button>
      </div>
      <div>
        <button onClick={props.togglePlayPause} className="controls__artwork">
          {props.isPlaying ? (
            <IoPauseSharp style={{ fill: "white" }} />
          ) : (
            <IoPlaySharp style={{ fill: "white" }} />
          )}
        </button>
      </div>
      <div>
        <button onClick={props.handleNext}>
          <IoPlaySkipForwardSharp style={{ fill: "white" }} />
        </button>
      </div>
    </div>
  );
}
