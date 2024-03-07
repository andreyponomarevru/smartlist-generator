import React from "react";
import {
  FaDownload,
  FaFileImport,
  FaFileAlt,
  FaFilter,
  FaRegWindowMaximize,
  FaListUl,
} from "react-icons/fa";

//import { Group } from "../../lib/group/group";
import {
  exportPlaylistAsJSON,
  exportPlaylistToM3U,
  exportSavedFiltersToJSON,
} from "../../utils/misc";
import { EditableText } from "../../lib/editable-text/editable-text";
import { toHourMinSec } from "../../utils/misc";
import { useGlobalState } from "../../hooks/use-global-state";

import "./playlist-page.scss";

export function PlaylistPage() {
  const { playlist } = useGlobalState();

  return (
    <div className="playlist-builder-page">
      <div></div>
      <section className="playlist-builder-page__section">
        <header className="playlist-builder-page__playlist-headers">
          <div className="playlist-builder-page__playlist-header-one">
            <EditableText
              className="playlist-builder-page__playlist-name"
              editable={playlist.name}
            />
            <div className="playlist-builder-page__duration">
              {toHourMinSec(
                Object.values(playlist.tracks)
                  .flat()
                  .reduce((total, track) => track.duration + total, 0),
              )}
            </div>
          </div>
          <div className="playlist-builder-page__playlist-header-two">
            <button
              onClick={playlist.handleResetGroups}
              className="playlist-builder-page__btn btn btn_theme_transparent-black"
            >
              <span>Reset groups</span>
            </button>

            <div>
              <button
                onClick={playlist.handleResetGroups}
                className="playlist-builder-page__btn btn btn_theme_transparent-black"
              >
                <FaListUl /> <FaRegWindowMaximize />
              </button>
            </div>
          </div>
        </header>

        {playlist.groups.length === 0 && (
          <div className="playlist-builder-page__add-new-group-btns">
            <button
              className="btn btn_theme_transparent-black add-section-btn"
              onClick={() => playlist.handleAddGroup(0, "saved-filter")}
            >
              <FaFileAlt className="icon" />
              <span>Use saved filters</span>
            </button>
            <button
              className="btn btn_theme_transparent-black add-section-btn"
              onClick={() => playlist.handleAddGroup(0, "new-filter")}
            >
              <FaFilter className="icon" />+<span>Create a new filter</span>
            </button>
          </div>
        )}
        {/*playlist.groups.map((groupId, index) => (
          <Group groupId={groupId} key={groupId} index={index} />
        ))*/}
      </section>

      <nav className="playlist-builder-page__controls playlist-builder-page__controls_bottom">
        <button
          onClick={() =>
            exportPlaylistToM3U(
              playlist.name.state.text,
              playlist.tracks,
              playlist.groups,
            )
          }
          className="playlist-builder-page__btn btn btn_theme_transparent-black"
          disabled={Object.values(playlist.tracks).flat().length === 0}
        >
          <FaDownload className="icon" />
          <span>Export as M3U</span>
        </button>
        <button
          onClick={() =>
            exportPlaylistAsJSON(playlist.name.state.text, playlist.tracks)
          }
          className="playlist-builder-page__btn btn btn_theme_transparent-black"
          disabled={Object.values(playlist.tracks).flat().length === 0}
        >
          <FaDownload className="icon" />
          <span>Export as JSON</span>
        </button>
        <div></div>
      </nav>
    </div>
  );
}
