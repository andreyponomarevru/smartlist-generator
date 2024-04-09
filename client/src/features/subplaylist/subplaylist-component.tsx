import React from "react";
import { useFormContext } from "react-hook-form";
import { FaMinus, FaRedo, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { LuCopy } from "react-icons/lu";

import { toHourMinSec } from "../../utils";
import {
  FilterFormValues,
  TrackMeta,
  SavedFilterFormValues,
} from "../../types";
import { useGlobalState } from "../../hooks/use-global-state";
import { Direction } from "../playlist/use-playlist-extended";
import { extractFilename } from "../../utils";

import "./subplaylist.scss";

interface SubplaylistProps extends React.HTMLAttributes<HTMLDivElement> {
  formId: string;
  groupId?: number;
  tracks: TrackMeta[];
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

export function Subplaylist(props: SubplaylistProps) {
  const {
    player: { activeTrack, isPlaying, play, togglePlay },
  } = useGlobalState();

  const form = useFormContext<FilterFormValues & SavedFilterFormValues>();

  return (
    props.tracks.length > 0 && (
      <ol className={`subplaylist ${props.className || ""}`}>
        {props.tracks.map((track: TrackMeta, index) => {
          return (
            <li
              key={track.trackId + track.duration + track.title}
              className={`track ${
                activeTrack?.trackId === track.trackId && isPlaying
                  ? "track_playing"
                  : activeTrack?.trackId === track?.trackId
                    ? "track_paused"
                    : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (activeTrack?.trackId === track.trackId) {
                  togglePlay(!isPlaying);
                } else {
                  play(track);
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
                  disabled={index === 0 || props.tracks.length === 1}
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
                  disabled={
                    props.tracks.length - 1 === index ||
                    props.tracks.length === 1
                  }
                >
                  <FaArrowDown className="icon" />
                </button>
              </div>
              <span className="track__year">{track.year}</span>
              <span className="track__main-meta">
                <span className="track__artists">
                  {track.artists.join(", ")}
                </span>
                <span className="track__title">{track.title}</span>
                <span className="track__genres">
                  {track.genres.map((name) => (
                    <span key={name} className="track__genre">
                      {name}
                    </span>
                  ))}
                </span>
              </span>
              <div className="track__duration">
                {toHourMinSec(track.duration)}
              </div>
              <div className="track__controls">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(
                      extractFilename(track.filePath),
                    );
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
                      return props.onResubmit(formValues, track.trackId);
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
                    props.onRemoveTrack(track.trackId);
                  }}
                  className="btn btn_type_icon btn_hover_grey-20"
                >
                  <FaMinus className="icon" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    )
  );
}
