import React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import { FaChevronUp, FaChevronDown, FaMinus, FaRedo } from "react-icons/fa";

import { toHourMinSec } from "../../utils/misc";
import {
  FilterFormValues,
  TrackMeta,
  SavedFilterFormValues,
} from "../../types";
import { TrackToReorder, TrackToReplace } from "../../hooks/use-playlist";

import "./playlist.scss";

interface PlaylistProps extends React.HTMLAttributes<HTMLDivElement> {
  handleSubmit: UseFormHandleSubmit<
    FilterFormValues | SavedFilterFormValues,
    undefined
  >;
  groupId: number;
  tracks: Record<string, TrackMeta[]>;
  setPlayingIndex: ({
    groupId,
    index,
  }: {
    groupId: number;
    index: number;
  }) => void;
  onReorderTrack: ({ index, direction, groupId }: TrackToReorder) => void;
  onReplaceTrack: ({ groupId, trackId, formValues }: TrackToReplace) => void;
  onRemoveTrack: (groupId: number, trackId: number) => void;

  savedFilter?: FilterFormValues;
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
                props.setPlayingIndex({ groupId: props.groupId, index });
              }
            }}
          >
            <div className="track__controls">
              <button
                className="btn btn_theme_black"
                onClick={() =>
                  props.onReorderTrack({
                    index,
                    direction: "UP",
                    groupId: props.groupId,
                  })
                }
                disabled={
                  index === 0 || props.tracks[`${props.groupId}`].length === 1
                }
              >
                <FaChevronUp style={{ fill: "white" }} />
              </button>
              <button
                className="btn btn_theme_black"
                onClick={() =>
                  props.onReorderTrack({
                    index,
                    direction: "DOWN",
                    groupId: props.groupId,
                  })
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
                onClick={props.handleSubmit(
                  (e: FilterFormValues | SavedFilterFormValues) => {
                    if ("templateId" in e && props.savedFilter) {
                      props.onReplaceTrack({
                        groupId: props.groupId,
                        trackId: track.trackId,
                        formValues: props.savedFilter,
                      });
                    } else if ("filters" in e) {
                      props.onReplaceTrack({
                        groupId: props.groupId,
                        trackId: track.trackId,
                        formValues: e,
                      });
                    }
                  }
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
            </div>
          </li>
        );
      })}
    </ul>
  );
}
