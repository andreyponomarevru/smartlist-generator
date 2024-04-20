import React from "react";
import { FaMinus, FaRedo, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";

import { toHourMinSec } from "../../../utils";
import { TrackMeta } from "../../../types";
import type { Direction } from "../../playlist";
import { extractFilename } from "../../../utils";
import { usePlayer } from "../../player";

import "./track.scss";

interface Props {
  meta: TrackMeta;
  index: number;
  tracksTotal: number;

  formId: string;
  onRemoveTrack: (trackId: number) => void;
  onReorderTracks: ({
    index,
    direction,
  }: {
    index: number;
    direction: Direction;
  }) => void;
  onResubmit: (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    trackId: number,
  ) => void;
}

export function Track(props: Props) {
  const {
    player: { play, togglePlay, isPlaying, activeTrack },
  } = usePlayer();

  function handleCopyFilePathToClipboardClick(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    navigator.clipboard.writeText(extractFilename(props.meta.filePath));
  }

  function handleTrackClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    e.stopPropagation();
    if (activeTrack?.trackId === props.meta.trackId) {
      togglePlay(!isPlaying);
    } else {
      play(props.meta);
    }
  }

  function handleTrackReorderUp(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    props.onReorderTracks({ index: props.index, direction: "UP" });
  }

  function handleTrackReorderDown(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    props.onReorderTracks({ index: props.index, direction: "DOWN" });
  }

  function handleTrackResubmit(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    props.onResubmit(e, props.meta.trackId);
  }

  function handleTrackRemove(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) {
    e.stopPropagation();
    props.onRemoveTrack(props.meta.trackId);
  }

  return (
    <li
      key={props.meta.trackId + props.meta.duration + props.meta.title}
      className={`track ${
        activeTrack?.trackId === props.meta.trackId && isPlaying
          ? "track_playing"
          : activeTrack?.trackId === props.meta?.trackId
            ? "track_paused"
            : ""
      }`}
      onClick={handleTrackClick}
      role="presentation"
    >
      <div className="track__sort-buttons">
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-20"
          onClick={handleTrackReorderUp}
          disabled={props.index === 0 || props.tracksTotal === 1}
        >
          <FaArrowUp className="icon" />
        </button>
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-20"
          onClick={handleTrackReorderDown}
          disabled={
            props.tracksTotal - 1 === props.index || props.tracksTotal === 1
          }
        >
          <FaArrowDown className="icon" />
        </button>
      </div>
      <span className="track__year">{props.meta.year}</span>
      <span className="track__main-meta">
        <span className="track__artists">{props.meta.artists.join(", ")}</span>
        <span className="track__title">{props.meta.title}</span>
        <span className="track__genres">
          {props.meta.genres.map((name) => (
            <span key={name} className="track__genre">
              {name}
            </span>
          ))}
        </span>
      </span>
      <div className="track__duration">{toHourMinSec(props.meta.duration)}</div>
      <div className="track__controls">
        <button
          type="button"
          onClick={handleCopyFilePathToClipboardClick}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <LuCopy className="icon" />
        </button>
        <button
          name="resubmit"
          onClick={handleTrackResubmit}
          type="submit"
          form={props.formId}
          disabled={false}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaRedo className="icon" />
        </button>
        <button
          type="button"
          onClick={handleTrackRemove}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaMinus className="icon" />
        </button>
      </div>
    </li>
  );
}
