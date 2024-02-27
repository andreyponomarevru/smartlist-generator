import React from "react";
import {
  IoMdVolumeHigh,
  IoMdVolumeOff,
  IoMdVolumeLow,
  IoIosClose,
} from "react-icons/io";

import { Controls } from "./controls/controls";
import { toHourMinSec } from "../../utils/misc";
import { useGlobalState } from "../../hooks/use-global-state";

import "./player.scss";

interface PlayerProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Player(props: PlayerProps) {
  const { player } = useGlobalState();

  return (
    <div className={`player ${player.activeTrack ? "" : "player_disabled"}`}>
      <Controls className="player__artwork" />
      <div className="player__meta">
        <p className="player__artist">
          {player.activeTrack?.artist.join(", ")}
        </p>
        <p>&nbsp;—&nbsp;</p>
        <p className="player__title">{player.activeTrack?.title}</p>
        <p>&nbsp;&middot;&nbsp;</p>
        <p className="player__year">{player.activeTrack?.year}</p>
        <audio
          src={player.src}
          ref={player.audioRef}
          onLoadedMetadata={player.onLoadedMetadata}
          onEnded={player.handleNext}
        />
      </div>
      <div className="player__progressbar">
        <span className="player__time player__time_current">
          {toHourMinSec(player.timeProgress)}
        </span>
        <input
          type="range"
          ref={player.progressBarRef}
          defaultValue="0"
          onChange={player.handleProgressChange}
          className="player__line"
        />
        <span className="player__time player__time_total">
          {toHourMinSec(player.duration)}
        </span>
        <div className="player__volume">
          <button onClick={() => player.setIsMuted((prev) => !prev)}>
            {player.isMuted || player.volume < 5 ? (
              <IoMdVolumeOff style={{ fill: "white" }} />
            ) : player.volume < 40 ? (
              <IoMdVolumeLow style={{ fill: "white" }} />
            ) : (
              <IoMdVolumeHigh style={{ fill: "white" }} />
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
            className="player__volume-bar"
          />
        </div>
      </div>
    </div>
  );
}
