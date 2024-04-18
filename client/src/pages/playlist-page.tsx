import React from "react";
import { FaDownload } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { Group } from "../features/playlist";
import { encodeRFC3986URIComponent } from "../utils";
import { toHourMinSec } from "../utils";
import { ModalProvider } from "../features/ui/modal";
import { useAppDispatch, useAppSelector } from "../hooks/redux-ts-helpers";
import {
  addGroup,
  resetPlaylist,
  selectAllTracks,
  selectGroups,
  selectPlaylist,
} from "../features/playlist";
import { TrackMeta } from "../types";

import "./playlist-page.scss";

export function exportPlaylistToM3U(
  playlistName: string,
  tracks: Record<string, TrackMeta[]>,
  groupIds: number[],
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#PLAYLIST:${playlistName}\n\n${groupIds
      .map((groupId) => tracks[`${groupId}`])
      .flat()
      .map((t) => `file://${encodeRFC3986URIComponent(t.filePath)}`)
      .join("\n")}`,
  )}`;
  link.download = `${playlistName}.m3u`;
  link.click();
}

export function PlaylistPage() {
  const dispatch = useAppDispatch();
  const playlist = useAppSelector(selectPlaylist);
  const groups = useAppSelector(selectGroups);
  const tracks = useAppSelector(selectAllTracks);
  /*const {
    playlist: { groups, tracks, name, handleGroupAdd, handlePlaylistReset },
  } = useGlobalState();*/

  /*const totalDuration = toHourMinSec(
    Object.values(tracks)
      .flat()
      .reduce((total, track) => track.duration + total, 0),
  );*/

  function handleExportPlaylistClick() {
    //exportPlaylistToM3U(name.state.text, tracks, groups);
  }

  return (
    <div className="playlist-page">
      <section className="playlist-page__section">
        <div className="playlist-page__playlist-header">
          <header className="header1 playlist-page__playlist-name">
            {"" /*name.state.text*/}
          </header>
          <div className="playlist-page__duration">{"" /*totalDuration*/}</div>
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
        <button
          type="button"
          onClick={handleExportPlaylistClick}
          className="btn btn_type_secondary"
          disabled={tracks.length === 0}
        >
          <FaDownload className="icon" />
          Export as M3U
        </button>
      </div>
    </div>
  );
}
