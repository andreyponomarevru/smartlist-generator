import React from "react";
import { useFormContext } from "react-hook-form";
import { FaMinus, FaRedo, FaArrowDown, FaArrowUp } from "react-icons/fa";
import { IoPlaySharp } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { toHourMinSec } from "../../utils/misc";
import {
  FilterFormValues,
  TrackMeta,
  SavedFilterFormValues,
} from "../../types";
import { useGlobalState } from "../../hooks/use-global-state";
import { Direction } from "../../hooks/use-playlist-extended";

import "./playlist.scss";

interface PlaylistProps extends React.HTMLAttributes<HTMLDivElement> {
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

export function Playlist(props: PlaylistProps) {
  const { player } = useGlobalState();
  const form = useFormContext<FilterFormValues & SavedFilterFormValues>();

  return (
    props.tracks.length > 0 && (
      <ol className={`playlist ${props.className || ""}`}>
        {props.tracks.map((track: TrackMeta, index) => {
          return (
            <li
              key={track.trackId + track.duration + track.title}
              className="track"
              onClick={(e) => {
                e.stopPropagation();
                if ((e.target as HTMLLIElement).nodeName === "SPAN") {
                  //player.setPlayingIndex({ groupId: groupId, index });
                }
              }}
              role="presentation"
            >
              <div className="track__sort-buttons">
                <button
                  className="btn btn_type_icon btn_hover_grey-20"
                  onClick={() =>
                    props.onReorderTracks({ index, direction: "UP" })
                  }
                  disabled={index === 0 || props.tracks.length === 1}
                >
                  <FaArrowUp className="icon" />
                </button>
                <button
                  className="btn btn_type_icon btn_hover_grey-20"
                  onClick={() =>
                    props.onReorderTracks({ index, direction: "DOWN" })
                  }
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
                  {track.artist.join(", ")}
                </span>
                <span className="track__title">{track.title}</span>
                <span className="track__genres">
                  {track.genre.map((name) => (
                    <span key={name} className="track__genre">
                      {name}
                    </span>
                  ))}
                </span>
              </span>
              <span className="track__duration">
                {toHourMinSec(track.duration)}
              </span>
              <div className="track__controls">
                <span className="btn btn_type_icon btn_hover_grey-20">
                  <IoPlaySharp className="icon" />
                </span>
                <span className="btn btn_type_icon btn_hover_grey-20">
                  <IoMdInformationCircleOutline className="icon" />
                </span>
                <span className="btn btn_type_icon btn_hover_grey-20">
                  <LuCopy className="icon" />
                </span>
                <button
                  name="resubmit"
                  onClick={form.handleSubmit((formValues) =>
                    props.onResubmit(formValues, track.trackId),
                  )}
                  type="submit"
                  form={props.formId}
                  disabled={false}
                  className="btn btn_type_icon btn_hover_grey-20"
                >
                  <FaRedo className="icon" />
                </button>
                <button
                  onClick={() => props.onRemoveTrack(track.trackId)}
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
