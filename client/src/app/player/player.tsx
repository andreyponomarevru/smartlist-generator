import React from "react";
import {
  IoMdVolumeHigh,
  IoMdVolumeOff,
  IoMdVolumeLow,
  IoIosClose,
} from "react-icons/io";

import { Controls } from "./controls/controls";
import { TrackMeta } from "../../types";
import { toHourMinSec } from "../../utils/misc";

import "./player.scss";

interface PlayerProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTrack: TrackMeta | null;
  tracks: Record<string, TrackMeta[]>;
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  progressBarRef: React.MutableRefObject<HTMLInputElement | null>;
  isPlaying: boolean;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  togglePlayPause: () => void;
  duration: number;
  setTimeProgress: React.Dispatch<React.SetStateAction<number>>;
  handleNext: () => void;
  handlePrevious: () => void;
  src: string;
  onLoadedMetadata: () => void;
  timeProgress: number;
  handleProgressChange: () => void;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
  volume: number;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  setPlayingIndex: React.Dispatch<
    React.SetStateAction<{
      groupId: number;
      index: number;
    } | null>
  >;
}

export function Player(props: PlayerProps) {
  return (
    <div className={`player ${props.activeTrack ? "" : "player_disabled"}`}>
      <Controls
        className="player__artwork"
        audioRef={props.audioRef}
        progressBarRef={props.progressBarRef}
        isPlaying={props.isPlaying}
        setIsPlaying={props.setIsPlaying}
        togglePlayPause={props.togglePlayPause}
        duration={props.duration}
        setTimeProgress={props.setTimeProgress}
        setPlayingTrackIndex={props.setPlayingIndex}
        handleNext={props.handleNext}
        handlePrevious={props.handlePrevious}
      />
      <div className="player__meta">
        <p className="player__artist">{props.activeTrack?.artist.join(", ")}</p>
        <p>&nbsp;—&nbsp;</p>
        <p className="player__title">{props.activeTrack?.title}</p>
        <p>&nbsp;&middot;&nbsp;</p>
        <p className="player__year">{props.activeTrack?.year}</p>
        <audio
          src={props.src}
          ref={props.audioRef}
          onLoadedMetadata={props.onLoadedMetadata}
          onEnded={props.handleNext}
        />
      </div>
      <div className="player__progressbar">
        <span className="player__time player__time_current">
          {toHourMinSec(props.timeProgress)}
        </span>
        <input
          type="range"
          ref={props.progressBarRef}
          defaultValue="0"
          onChange={props.handleProgressChange}
          className="player__line"
        />
        <span className="player__time player__time_total">
          {toHourMinSec(props.duration)}
        </span>
        <div className="player__volume">
          <button onClick={() => props.setIsMuted((prev) => !prev)}>
            {props.isMuted || props.volume < 5 ? (
              <IoMdVolumeOff style={{ fill: "white" }} />
            ) : props.volume < 40 ? (
              <IoMdVolumeLow style={{ fill: "white" }} />
            ) : (
              <IoMdVolumeHigh style={{ fill: "white" }} />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={props.volume}
            onChange={(e) => props.setVolume(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #f50 ${props.volume}%, #ccc ${props.volume}%)`,
            }}
            className="player__volume-bar"
          />
        </div>
      </div>
    </div>
  );
}
