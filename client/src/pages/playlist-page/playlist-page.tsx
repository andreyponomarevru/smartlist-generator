import React from "react";
import { FaDownload } from "react-icons/fa";
import { IoMdAddCircle } from "react-icons/io";

import { Group } from "./group/group";
import { exportPlaylistToM3U } from "../../utils/misc";
import { toHourMinSec } from "../../utils/misc";
import { useGlobalState } from "../../hooks/use-global-state";
import { SavedFiltersProvider } from "../../hooks/use-saved-filters";

import "./playlist-page.scss";

export function PlaylistPage() {
  const {
    playlist: { groups, tracks, name, handleGroupAdd, handlePlaylistReset },
  } = useGlobalState();

  const totalDuration = toHourMinSec(
    Object.values(tracks)
      .flat()
      .reduce((total, track) => track.duration + total, 0),
  );

  function handleExportPlaylistClick() {
    exportPlaylistToM3U(name.state.text, tracks, groups);
  }

  return (
    <div className="playlist-page">
      <section className="playlist-page__section">
        <div className="playlist-page__playlist-header">
          <header className="header1 playlist-page__playlist-name">
            {name.state.text}
          </header>
          <div className="playlist-page__duration">{totalDuration}</div>
        </div>

        <div className="playlist-page__btns-group">
          <button
            onClick={handlePlaylistReset}
            className="btn btn_type_secondary"
          >
            <span>Reset</span>
          </button>
          <button
            className="btn btn_type_primary add-section-btn"
            onClick={() => handleGroupAdd(0)}
          >
            <IoMdAddCircle className="icon" />
            <span>Add Group</span>
          </button>
        </div>

        <SavedFiltersProvider>
          {groups.map((groupId, index) => (
            <Group groupId={groupId} key={groupId} index={index} />
          ))}
        </SavedFiltersProvider>
      </section>

      <div className="playlist-page__btns-group">
        <button
          onClick={handleExportPlaylistClick}
          className="btn btn_type_secondary"
          disabled={Object.values(tracks).flat().length === 0}
        >
          <FaDownload className="icon" />
          <span>Export as M3U</span>
        </button>
      </div>
    </div>
  );
}
