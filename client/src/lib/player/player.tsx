import React from "react";
import { IoMdVolumeHigh, IoMdVolumeOff, IoMdVolumeLow } from "react-icons/io";

import { Controls } from "./controls/controls";
import { toHourMinSec } from "../../utils";
import { useGlobalState } from "../../hooks/use-global-state";

import "./player.scss";

export function Player() {
  const { player } = useGlobalState();

  if (!player.activeTrack) return null;

  return (
    <div className={`player ${player.activeTrack ? "" : "player_disabled"}`}>
      <div className="player__meta">
        <Controls />
        <span>
          {player.activeTrack?.artists.join(", ")}&nbsp;—&nbsp;
          {player.activeTrack?.title}
        </span>
        <audio
          src={player.src}
          ref={player.audioRef}
          onLoadedMetadata={player.onLoadedMetadata}
          onEnded={player.reset}
        />
      </div>
      <div className="player__progress-bar-wrapper">
        <span className="player__time player__time_current">
          {toHourMinSec(player.timeProgress)}
        </span>
        <input
          type="range"
          ref={player.progressBarRef}
          defaultValue="0"
          onChange={player.handleProgressChange}
          className="player__progress-bar"
        />
        <span className="player__time player__time_total">
          {toHourMinSec(player.duration)}
        </span>
      </div>
      <div className="player__volume">
        <button
          type="button"
          onClick={() => player.setIsMuted((prev) => !prev)}
        >
          {player.isMuted || player.volume < 5 ? (
            <IoMdVolumeOff />
          ) : player.volume < 40 ? (
            <IoMdVolumeLow />
          ) : (
            <IoMdVolumeHigh />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={player.volume}
          onChange={(e) => player.setVolume(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, #f50 ${player.volume}%, #ccc ${player.volume}%)`,
          }}
          className="player__progress-bar"
        />
      </div>
    </div>
  );
}
