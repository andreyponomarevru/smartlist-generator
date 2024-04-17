import React from "react";
import { useFormContext } from "react-hook-form";
import { FaMinus, FaRedo, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";

import { toHourMinSec } from "../../../utils";
import {
  FilterFormValues,
  TrackMeta,
  SavedFilterFormValues,
} from "../../../types";
import type { Direction } from "../../playlist";
import { extractFilename } from "../../../utils";

import "./track.scss";

interface TrackProps {
  meta: TrackMeta;
  index: number;
  tracksTotal: number;

  // groupId?: string; // remove if it works without it
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
    formValues: FilterFormValues & SavedFilterFormValues,
    trackId: number,
  ) => void;
}

export function Track(props: TrackProps) {
  const form = useFormContext<FilterFormValues & SavedFilterFormValues>();
  const { meta, index } = props;

  /*const {
    player: { activeTrack, isPlaying, play, togglePlay },
  } = useGlobalState();*/
  const player = {
    activeTrack: { trackId: 0 },
    isPlaying: false,
    togglePlay: (arg: any) => {},
    play: (arg: any) => {},
  };
  const { activeTrack, isPlaying, togglePlay, play } = player;

  return (
    <li
      key={meta.trackId + meta.duration + meta.title}
      className={`track ${
        activeTrack?.trackId === meta.trackId && isPlaying
          ? "track_playing"
          : activeTrack?.trackId === meta?.trackId
            ? "track_paused"
            : ""
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (activeTrack?.trackId === meta.trackId) {
          togglePlay(!isPlaying);
        } else {
          play(meta);
        }
      }}
      role="presentation"
    >
      <div className="track__sort-buttons">
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-20"
          onClick={(e) => {
            e.stopPropagation();
            props.onReorderTracks({ index, direction: "UP" });
          }}
          disabled={index === 0 || props.tracksTotal === 1}
        >
          <FaArrowUp className="icon" />
        </button>
        <button
          type="button"
          className="btn btn_type_icon btn_hover_grey-20"
          onClick={(e) => {
            e.stopPropagation();
            props.onReorderTracks({ index, direction: "DOWN" });
          }}
          disabled={props.tracksTotal - 1 === index || props.tracksTotal === 1}
        >
          <FaArrowDown className="icon" />
        </button>
      </div>
      <span className="track__year">{meta.year}</span>
      <span className="track__main-meta">
        <span className="track__artists">{meta.artists.join(", ")}</span>
        <span className="track__title">{meta.title}</span>
        <span className="track__genres">
          {meta.genres.map((name) => (
            <span key={name} className="track__genre">
              {name}
            </span>
          ))}
        </span>
      </span>
      <div className="track__duration">{toHourMinSec(meta.duration)}</div>
      <div className="track__controls">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(extractFilename(meta.filePath));
          }}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <LuCopy className="icon" />
        </button>
        <button
          name="resubmit"
          onClick={(e) => {
            e.stopPropagation();
            form.handleSubmit((formValues) => {
              return props.onResubmit(formValues, meta.trackId);
            })(e);
          }}
          type="submit"
          form={props.formId}
          disabled={false}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaRedo className="icon" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            props.onRemoveTrack(meta.trackId);
          }}
          className="btn btn_type_icon btn_hover_grey-20"
        >
          <FaMinus className="icon" />
        </button>
      </div>
    </li>
  );
}
