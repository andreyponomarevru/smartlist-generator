import React from "react";
import { IoMdVolumeHigh, IoMdVolumeOff, IoMdVolumeLow } from "react-icons/io";

import { Controls } from "./controls-component";
import { toHourMinSec } from "../../../utils";
import { usePlayer } from "../hooks/use-player";

import "./player.scss";

export function Player() {
  const {
    player: {
      activeTrack,
      src,
      audioRef,
      reset,
      handleMetadataLoaded,
      timeProgress,
      progressBarRef,
      handleProgressChange,
      duration,
      setIsMuted,
      isMuted,
      volume,
      setVolume,
    },
  } = usePlayer();

  if (!activeTrack) return null;

  return (
    <div className={`player ${activeTrack ? "" : "player_disabled"}`}>
      <div className="player__meta">
        <Controls />
        <span>
          {activeTrack?.artists.join(", ")}&nbsp;—&nbsp;
          {activeTrack?.title}
        </span>
        <audio
          src={src}
          ref={audioRef}
          onLoadedMetadata={handleMetadataLoaded}
          onEnded={reset}
        />
      </div>
      <div className="player__progress-bar-wrapper">
        <span className="player__time player__time_current">
          {toHourMinSec(timeProgress)}
        </span>
        <input
          type="range"
          ref={progressBarRef}
          defaultValue="0"
          onChange={handleProgressChange}
          className="player__progress-bar"
        />
        <span className="player__time player__time_total">
          {toHourMinSec(duration)}
        </span>
      </div>
      <div className="player__volume">
        <button type="button" onClick={() => setIsMuted((prev) => !prev)}>
          {isMuted || volume < 5 ? (
            <IoMdVolumeOff />
          ) : volume < 40 ? (
            <IoMdVolumeLow />
          ) : (
            <IoMdVolumeHigh />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #f50 ${volume}%, #ccc ${volume}%)`,
          }}
          className="player__progress-bar"
        />
      </div>
    </div>
  );
}
