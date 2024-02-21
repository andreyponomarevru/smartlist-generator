import React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import {
  FaChevronUp,
  FaChevronDown,
  FaPlus,
  FaMinus,
  FaRedo,
} from "react-icons/fa";

import { toHourMinSec } from "../../utils/misc";
import { FormValues, TrackMeta } from "../../types";

import "./playlist.scss";

interface PlaylistProps extends React.HTMLAttributes<HTMLDivElement> {
  handleSubmit: UseFormHandleSubmit<FormValues, undefined>;
  groupId: number;
  tracks: Record<string, TrackMeta[]>;
  setPlayingIndex: ({
    groupId,
    index,
  }: {
    groupId: number;
    index: number;
  }) => void;
  onReorderTrack: (
    index: number,
    direction: "UP" | "DOWN",
    groupId: number
  ) => void;
  onReplaceTrack: (
    groupId: number,
    trackId: number,
    formValues: FormValues
  ) => void;
  onRemoveTrack: (groupId: number, trackId: number) => void;
}

export function Playlist(props: PlaylistProps) {
  return (
    <ul className={`playlist ${props.className || ""}`}>
      {props.tracks[`${props.groupId}`].map((track: TrackMeta, index) => {
        return (
          <li
            key={track.trackId}
            className="track"
            onClick={(e) => {
              e.stopPropagation();
              if ((e.target as HTMLLIElement).nodeName === "SPAN") {
                props.setPlayingIndex({
                  groupId: props.groupId,
                  index,
                });
              }
            }}
          >
            <div className="track__controls">
              <button
                className="btn btn_theme_black"
                onClick={() => props.onReorderTrack(index, "UP", props.groupId)}
                disabled={
                  index === 0 || props.tracks[`${props.groupId}`].length === 1
                }
              >
                <FaChevronUp style={{ fill: "white" }} />
              </button>
              <button
                className="btn btn_theme_black"
                onClick={() =>
                  props.onReorderTrack(index, "DOWN", props.groupId)
                }
                disabled={
                  props.tracks[`${props.groupId}`].length - 1 === index ||
                  props.tracks[`${props.groupId}`].length === 1
                }
              >
                <FaChevronDown style={{ fill: "white" }} />
              </button>
            </div>

            <span className="track__year">{track.year}</span>
            <span className="track__artist-and-title">
              <span className="track__artists">{track.artist.join(", ")}</span>
              <span className="track__title">{track.title}</span>
            </span>
            <span className="track__genres">
              {track.genre.map((name) => (
                <span key={name} className="track__genre">
                  {name}
                </span>
              ))}
            </span>
            <span className="track__duration">
              {toHourMinSec(track.duration)}
            </span>
            <div className="track__controls">
              <button
                name="b"
                onClick={props.handleSubmit((e) =>
                  props.onReplaceTrack(props.groupId, track.trackId, e)
                )}
                type="submit"
                form={`filter-form-${props.groupId}`}
                disabled={false}
                className="btn btn_theme_black track__btn"
              >
                <FaRedo />
              </button>
              <span
                onClick={() =>
                  props.onRemoveTrack(props.groupId, track.trackId)
                }
                className="btn btn_theme_black track__btn"
              >
                <FaMinus />
              </span>
              <button
                name="a"
                type="submit"
                form={`filter-form-${props.groupId}`}
                disabled={false}
                className="btn btn_theme_black track__btn"
              >
                <FaPlus />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
