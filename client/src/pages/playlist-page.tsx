import React from "react";
import { IoMdAddCircle } from "react-icons/io";

import { Group } from "../features/playlist";
import { toHourMinSec } from "../utils";
import { ModalProvider } from "../features/ui/modal";
import { useAppDispatch, useAppSelector } from "../hooks/redux-ts-helpers";
import {
  addGroup,
  resetPlaylist,
  selectTracks,
  selectGroups,
} from "../features/playlist";
import { ExportPlaylistToM3UBtn } from "../features/playlist";

import "./playlist-page.scss";

export function PlaylistPage() {
  const dispatch = useAppDispatch();
  const tracks = useAppSelector(selectTracks);
  const groups = useAppSelector(selectGroups);

  const playlistName = `Playlist ${new Date().toDateString()}`;

  const totalDuration = toHourMinSec(
    Object.values(tracks)
      .flat()
      .reduce((total, track) => track.duration + total, 0),
  );

  return (
    <div className="playlist-page">
      <section className="playlist-page__section">
        <div className="playlist-page__playlist-header">
          <header className="header1 playlist-page__playlist-name">
            {playlistName}
          </header>
          <div className="playlist-page__duration">{totalDuration}</div>
        </div>

        <div className="playlist-page__btns-group">
          <button
            type="button"
            onClick={() => dispatch(resetPlaylist())}
            className="btn btn_type_secondary"
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn_type_primary add-section-btn"
            onClick={() => dispatch(addGroup({ insertAt: 0 }))}
          >
            <IoMdAddCircle className="icon" />
            Add Group
          </button>
        </div>

        <ModalProvider>
          {groups.map((groupId, index) => (
            <Group groupId={groupId} key={groupId} index={index} />
          ))}
        </ModalProvider>
      </section>

      <div className="playlist-page__btns-group">
        <ExportPlaylistToM3UBtn
          playlistName={playlistName}
          tracks={tracks}
          tracksTotal={tracks.length}
        />
      </div>
    </div>
  );
}
