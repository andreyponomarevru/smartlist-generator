import React from "react";
import { IoMdVolumeHigh, IoMdVolumeOff, IoMdVolumeLow } from "react-icons/io";

import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { API_ROOT_URL } from "../config/env";
import { useFetch } from "../hooks/use-fetch";
import { GetStatsRes } from "../types";
import { Btn } from "../lib/btn/btn";
import { Group } from "../lib/group/group";
import {
  exportFiltersTemplate,
  exportPlaylistAsJSON,
  exportPlaylistAsM3U,
  toHoursMinSec,
} from "../utils/misc";
import { Sidebar } from "../lib/sidebar/sidebar";
import { EditableText } from "../lib/editable-text/editable-text";
import { usePlaylist } from "../hooks/use-playlist";
import { usePlayer } from "../hooks/use-player";
import { Controls } from "./controls/controls";

import "./app.scss";

export function App() {
  const { state: yearsRes, fetchNow: fetchYears } = useFetch<GetStatsRes>();
  const { state: genresRes, fetchNow: fetchGenres } = useFetch<GetStatsRes>();
  React.useEffect(() => {
    fetchYears(`${API_ROOT_URL}/lib/stats/years`);
    fetchGenres(`${API_ROOT_URL}/lib/stats/genres`);
  }, []);

  const { playlist, groups, tracks } = usePlaylist();

  const player = usePlayer(playlist.tracks);

  return (
    <ErrorBoundary>
      <main className="app">
        <Sidebar
          className="app__sidebar"
          stats={{ years: yearsRes, genres: genresRes }}
        />

        <div className="app__main">
          <div className="app__header">
            <a className="app__logo" href="/">
              Smartlist Generator
            </a>
            <div className="app__controls app__controls_top">
              <Btn
                onClick={groups.handleReset}
                className="app__btn"
                name="Reset"
                theme="transparent-white"
              />
              <div></div>
              <label htmlFor="importblacklisted">
                <input
                  id="importblacklisted"
                  type="file"
                  onChange={tracks.handleImportBlacklisted}
                  hidden
                />
                <div className="app__btn btn btn_theme_transparent-white">
                  Import blacklisted tracks
                </div>
              </label>
              <Btn
                className="app__btn"
                name="Import JSON filters template"
                theme="transparent-white"
              />
            </div>
          </div>

          <header className="app__playlist-header">
            <EditableText className="app__playlist-name" text={playlist.name} />

            <div className="app__duration">
              {toHoursMinSec(
                Object.values(playlist.tracks)
                  .flat()
                  .reduce((total, track) => track.duration + total, 0)
              )}
            </div>
          </header>

          {playlist.groups.length === 0 && (
            <button
              className="btn btn_theme_transparent-black add-section-btn"
              onClick={() => groups.handleAdd(0)}
            >
              Add new section
            </button>
          )}

          {playlist.groups.map((groupId, index) => {
            return (
              <Group
                groupId={groupId}
                key={groupId}
                name={playlist.groupNames[`${groupId}`]}
                onAddGroup={() => groups.handleAdd(index + 1)}
                onDeleteGroup={() => groups.handleDestroy(groupId)}
                onRenameGroup={groups.handleRename}
                onToggle={() => groups.toggleIsGroupOpen(groupId)}
                onRemoveTrack={tracks.handleRemove}
                onReplaceTrack={tracks.handleReplace}
                onGetTrack={tracks.handleAdd}
                onGroupReorderUp={() => groups.handleReorder(index, "UP")}
                onGroupReorderDown={() => groups.handleReorder(index, "DOWN")}
                onFiltersChange={tracks.handleReset}
                isOpenGroupId={playlist.isGroupOpen}
                years={yearsRes}
                genres={genresRes}
                tracks={playlist.tracks}
                onReorderTrack={tracks.handleReorder}
                setPlayingIndex={player.setPlayingIndex}
              />
            );
          })}

          <nav className="app__controls app__controls_bottom">
            <Btn
              className="app__btn"
              name="Export playlist as M3U"
              theme="transparent-black"
              onClick={() =>
                exportPlaylistAsM3U(playlist.name.state.text, playlist.tracks)
              }
            />
            <Btn
              className="app__btn"
              name="Export playlist as JSON"
              theme="transparent-black"
              onClick={() =>
                exportPlaylistAsJSON(playlist.name.state.text, playlist.tracks)
              }
            />
            <div></div>
            <Btn
              className="app__btn"
              name="Export JSON filters template"
              theme="transparent-black"
              onClick={exportFiltersTemplate}
            />
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
          <p>&middot;</p>
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
            {player.formatTime(player.timeProgress)}
          </span>
          <input
            type="range"
            ref={player.progressBarRef}
            defaultValue="0"
            onChange={player.handleProgressChange}
            className="player__line"
          />
          <span className="player__time player__time_total">
            {player.formatTime(player.duration)}
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
