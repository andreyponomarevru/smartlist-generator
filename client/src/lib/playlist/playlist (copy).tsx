import React from "react";
import { UseFormHandleSubmit } from "react-hook-form";
import { FaChevronUp, FaChevronDown, FaMinus, FaRedo } from "react-icons/fa";
import { IoCopy } from "react-icons/io5";
import { LuCopy } from "react-icons/lu";
import { IoMdInformationCircleOutline } from "react-icons/io";

import { toHourMinSec } from "../../utils/misc";
import {
  FilterFormValues,
  TrackMeta,
  SavedFilterFormValues,
} from "../../types";
import { useGlobalState } from "../../hooks/use-global-state";

import "./playlist.scss";

interface PlaylistProps extends React.HTMLAttributes<HTMLDivElement> {
  handleSubmit: UseFormHandleSubmit<
    FilterFormValues | SavedFilterFormValues,
    undefined
  >;
  savedFilter?: FilterFormValues;
  tracks: TrackMeta[];
}

function Playlist(props: PlaylistProps) {
  const { playlist, player } = useGlobalState();

  const groupId = 0;

  return (
    <ul className={`playlist ${props.className || ""}`}>
      {/*playlist.tracks[`${groupId}`].map((track: TrackMeta, index) => {
        return (
          <li
            key={track.trackId}
            className="track"
            onClick={(e) => {
              e.stopPropagation();
              if ((e.target as HTMLLIElement).nodeName === "SPAN") {
                player.setPlayingIndex({ groupId: groupId, index });
              }
            }}
          >
            <div className="track__controls">
              <button
                className="btn btn_theme_black"
                onClick={() =>
                  playlist.handleReorderTracks({
                    index,
                    direction: "UP",
                    groupId: groupId,
                  })
                }
                disabled={
                  index === 0 || playlist.tracks[`${groupId}`].length === 1
                }
              >
                <FaChevronUp style={{ fill: "white" }} />
              </button>
              <button
                className="btn btn_theme_black"
                onClick={() =>
                  playlist.handleReorderTracks({
                    index,
                    direction: "DOWN",
                    groupId: groupId,
                  })
                }
                disabled={
                  playlist.tracks[`${groupId}`].length - 1 === index ||
                  playlist.tracks[`${groupId}`].length === 1
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
                    if ("savedFilterId" in e && props.savedFilter) {
                      playlist.handleReplaceTrack({
                        groupId: groupId,
                        trackId: track.trackId,
                        formValues: props.savedFilter,
                      });
                    } else if ("filters" in e) {
                      playlist.handleReplaceTrack({
                        groupId: groupId,
                        trackId: track.trackId,
                        formValues: e,
                      });
                    } else {
                      throw new Error("Unknown type of select");
                    }
                  }
                )}
                type="submit"
                form={`filter-form-${groupId}`}
                disabled={false}
                className="btn btn_theme_black track__btn"
              >
                <FaRedo />
              </button>
              <span
                onClick={() =>
                  playlist.handleRemoveTrack(groupId, track.trackId)
                }
                className="btn btn_theme_black track__btn"
              >
                <FaMinus />
              </span>
              <IoCopy />
              <LuCopy />
              <IoMdInformationCircleOutline />
            </div>
          </li>
        );
      })*/}
    </ul>
  );
}
