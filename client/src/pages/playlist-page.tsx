import React from "react";
import { IoMdAddCircle } from "react-icons/io";

import { Group } from "../features/playlist";
import { getPlaylistDuration } from "../features/playlist";
import { ModalProvider } from "../features/ui/modal";
import { useAppDispatch, useAppSelector } from "../hooks/redux-ts-helpers";
import {
  addGroup,
  resetPlaylist,
  selectTracks,
  selectGroups,
} from "../features/playlist";
import { ExportPlaylistToM3UBtn } from "../features/playlist/exporting-playlist-to-m3u";

import "./playlist-page.scss";
import { selectFilters } from "../features/filters/filters";

export function PlaylistPage() {
  const dispatch = useAppDispatch();

  const tracks = useAppSelector(selectTracks);
  const groups = useAppSelector(selectGroups);
  const savedFilters = useAppSelector(selectFilters);

  const playlistName = `Playlist ${new Date().toDateString()}`;

  return (
    <div className="playlist-page">
      <section className="playlist-page__section">
        <div className="playlist-page__playlist-header">
          <header className="header1 playlist-page__playlist-name">
            {playlistName}
          </header>
          <div className="playlist-page__duration">
            {getPlaylistDuration(tracks)}
          </div>
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
            disabled={Object.keys(savedFilters).length === 0}
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
          isDisabled={tracks.length === 0}
        />
      </div>
    </div>
  );
}
