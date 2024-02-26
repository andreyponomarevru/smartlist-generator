import React from "react";
import {
  IoMdVolumeHigh,
  IoMdVolumeOff,
  IoMdVolumeLow,
  IoIosClose,
} from "react-icons/io";
import {
  FaDownload,
  FaFileImport,
  FaUndo,
  FaFileAlt,
  FaFilter,
} from "react-icons/fa";

import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { Group } from "../lib/group/group";
import {
  exportPlaylistAsJSON,
  exportPlaylistToM3U,
  exportSavedFiltersToJSON,
} from "../utils/misc";
import { Sidebar } from "../lib/sidebar/sidebar";
import { EditableText } from "../lib/editable-text/editable-text";
import { usePlaylist } from "../hooks/use-playlist";
import { usePlayer } from "../hooks/use-player";
import { Controls } from "./controls/controls";
import { toHourMinSec } from "../utils/misc";
import { useSavedFilters } from "../hooks/use-saved-filters";
import { SavedFilter } from "../lib/saved-filter/saved-filter";
import { useStats } from "../hooks/api/use-stats";
import { Loader } from "../lib/loader/loader";
import { Message } from "../lib/message/message";

import "./app.scss";

export function App() {
  const playlist = usePlaylist();
  const savedFilters = useSavedFilters();
  const statsQuery = useStats(Array.from(playlist.excludedTracks));
  const player = usePlayer(playlist.tracks);

  if (statsQuery.isLoading) return <Loader for="page" color="pink" />;

  if (statsQuery.error) {
    return (
      <Message type="danger">
        Something went wrong while loading stats :(
      </Message>
    );
  }

  return (
    <ErrorBoundary>
      <main className="app">
        <Sidebar
          className="app__sidebar"
          stats={{
            years: statsQuery.data?.years.results,
            genres: statsQuery.data?.genres.results,
          }}
        />
        <div className="app__main">
          <div className="app__header">
            <a className="app__logo" href="/">
              Smartlist Generator
            </a>
            <div className="app__controls app__controls_top">
              <button
                onClick={playlist.handleResetGroups}
                className="app__btn btn btn_theme_transparent-white"
              >
                <span>Reset</span>
                <FaUndo className="icon" />
              </button>
              <div></div>
              <label htmlFor="importblacklisted">
                <input
                  id="importblacklisted"
                  type="file"
                  onChange={playlist.handleImportExcludedTracks}
                  multiple
                  hidden
                />
                <div className="app__btn btn btn_theme_transparent-white">
                  <span>Import blacklisted tracks (M3U)</span>
                  <FaFileImport className="icon" />
                </div>
              </label>
            </div>
          </div>

          <div className="app__saved-filters">
            <header className="app__saved-filters-header">
              Saved filters ({savedFilters.state.ids.length})
            </header>
            {savedFilters.state.ids.map((id) => (
              <SavedFilter
                key={
                  JSON.stringify(savedFilters.state.names[`${id}`]) + Date.now()
                }
                savedFilterId={id}
                name={savedFilters.state.names[id]}
                filter={savedFilters.state.settings[`${id}`]}
                handleDestroy={() => savedFilters.handleDestroy(id)}
                handleRename={savedFilters.handleRename}
              />
            ))}
            <div className="app__controls app__controls_bottom">
              <button
                onClick={() =>
                  exportSavedFiltersToJSON(
                    playlist.name.state.text,
                    savedFilters.state
                  )
                }
                className="app__btn btn btn_theme_transparent-black"
                disabled={savedFilters.state.ids.length === 0}
              >
                <span>Export as JSON</span>
                <FaDownload className="icon" />
              </button>
              <label htmlFor="importsavedfilters">
                <input
                  id="importsavedfilters"
                  type="file"
                  onChange={savedFilters.handleImportAsJSON}
                  multiple
                  hidden
                />
                <div className="app__btn btn btn_theme_transparent-black">
                  <span>Import as JSON</span>
                  <FaFileImport className="icon" />
                </div>
              </label>
            </div>
          </div>

          <div>
            <header className="app__playlist-header">
              <EditableText
                className="app__playlist-name"
                editable={playlist.name}
              />

              <div className="app__duration">
                {toHourMinSec(
                  Object.values(playlist.tracks)
                    .flat()
                    .reduce((total, track) => track.duration + total, 0)
                )}
              </div>
            </header>

            {playlist.groups.length === 0 && (
              <div className="app__btns">
                <button
                  className="btn btn_theme_transparent-black add-section-btn"
                  onClick={() => playlist.handleAddGroup(0, "saved-filter")}
                >
                  <span>Add new section (using saved filters)</span>
                  <FaFileAlt className="icon" />
                </button>
                <button
                  className="btn btn_theme_transparent-black add-section-btn"
                  onClick={() => playlist.handleAddGroup(0, "new-filter")}
                >
                  <span>Add new section (creating a new filter)</span>
                  <FaFilter className="icon" />
                </button>
              </div>
            )}

            {playlist.groups.map((groupId, index) => (
              <Group
                mode={playlist.groupModes[`${groupId}`]}
                groupId={groupId}
                key={groupId}
                name={playlist.groupNames[`${groupId}`]}
                onAddGroupWithSavedFilter={() =>
                  playlist.handleAddGroup(index + 1, "saved-filter")
                }
                onAddGroupWithNewFilter={() =>
                  playlist.handleAddGroup(index + 1, "new-filter")
                }
                onDeleteGroup={() => playlist.handleDestroyGroup(groupId)}
                onRenameGroup={playlist.handleRenameGroup}
                onToggle={() => playlist.toggleIsGroupOpen(groupId)}
                onRemoveTrack={playlist.handleRemoveTrack}
                onReplaceTrack={playlist.handleReplaceTrack}
                onGetTrack={playlist.handleAddTrack}
                onGroupReorderUp={() =>
                  playlist.handleReorderGroups(index, "UP")
                }
                onGroupReorderDown={() =>
                  playlist.handleReorderGroups(index, "DOWN")
                }
                onFiltersChange={playlist.handleResetTracks}
                isOpenGroupId={playlist.isGroupOpen}
                years={statsQuery.data?.years.results}
                genres={statsQuery.data?.genres.results}
                tracks={playlist.tracks}
                onReorderTrack={playlist.handleReorderTracks}
                setPlayingIndex={player.setPlayingIndex}
                saveFilter={savedFilters.handleSave}
                deleteFilter={savedFilters.handleDestroy}
                filters={savedFilters.state}
              />
            ))}
          </div>

          <nav className="app__controls app__controls_bottom">
            <button
              onClick={() =>
                exportPlaylistToM3U(
                  playlist.name.state.text,
                  playlist.tracks,
                  playlist.groups
                )
              }
              className="app__btn btn btn_theme_transparent-black"
              disabled={Object.values(playlist.tracks).flat().length === 0}
            >
              <span>Export as M3U</span>
              <FaDownload className="icon" />
            </button>
            <button
              onClick={() =>
                exportPlaylistAsJSON(playlist.name.state.text, playlist.tracks)
              }
              className="app__btn btn btn_theme_transparent-black"
              disabled={Object.values(playlist.tracks).flat().length === 0}
            >
              <span>Export as JSON</span>
              <FaDownload className="icon" />
            </button>
            <div></div>
          </nav>
        </div>
      </main>
      <div className={`player ${player.activeTrack ? "" : "player_disabled"}`}>
        <Controls
          className="player__artwork"
          audioRef={player.audioRef}
          progressBarRef={player.progressBarRef}
          isPlaying={player.isPlaying}
          setIsPlaying={player.setIsPlaying}
          togglePlayPause={player.togglePlayPause}
          duration={player.duration}
          setTimeProgress={player.setTimeProgress}
          setPlayingTrackIndex={player.setPlayingIndex}
          handleNext={player.handleNext}
          handlePrevious={player.handlePrevious}
        />
        <div className="player__meta">
          <p className="player__artist">
            {player.activeTrack?.artist.join(", ")}
          </p>
          <p>&nbsp;—&nbsp;</p>
          <p className="player__title">{player.activeTrack?.title}</p>
          <p>&nbsp;&middot;&nbsp;</p>
          <p className="player__year">{player.activeTrack?.year}</p>
          <audio
            src={player.src}
            ref={player.audioRef}
            onLoadedMetadata={player.onLoadedMetadata}
            onEnded={player.handleNext}
          />
        </div>
        <div className="player__progressbar">
          <span className="player__time player__time_current">
            {toHourMinSec(player.timeProgress)}
          </span>
          <input
            type="range"
            ref={player.progressBarRef}
            defaultValue="0"
            onChange={player.handleProgressChange}
            className="player__line"
          />
          <span className="player__time player__time_total">
            {toHourMinSec(player.duration)}
          </span>
          <div className="player__volume">
            <button onClick={() => player.setIsMuted((prev) => !prev)}>
              {player.isMuted || player.volume < 5 ? (
                <IoMdVolumeOff style={{ fill: "white" }} />
              ) : player.volume < 40 ? (
                <IoMdVolumeLow style={{ fill: "white" }} />
              ) : (
                <IoMdVolumeHigh style={{ fill: "white" }} />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={player.volume}
              onChange={(e) => player.setVolume(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #f50 ${player.volume}%, #ccc ${player.volume}%)`,
              }}
              className="player__volume-bar"
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
