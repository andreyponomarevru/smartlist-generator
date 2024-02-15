import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Select from "react-select";

import {
  FILTER_NAMES,
  GENRE_CONDITIONS,
  YEAR_CONDITIONS,
  OPERATORS,
} from "../config/constants";
import { ConditionSelect } from "../lib/group/condition-select";
import { YearValueSelect } from "../lib//group/year-value-select";
import { GenreValueSelect } from "../lib//group/genre-value-select";
import { State, useEditableText } from "../hooks/use-editable-text";
import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { API_ROOT_URL } from "../config/env";
import { useFetch } from "../hooks/use-fetch";
import {
  GetStatsRes,
  TrackMeta,
  Stats,
  FormValues,
  OptionsList,
} from "../types";
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
import { Track } from "../lib/track/track";
import { Player } from "../lib/player/player";
import { usePlaylist } from "../hooks/use-playlist";
import { usePlayer } from "../hooks/use-player";

import "./app.scss";

export function App() {
  const { state: yearsRes, fetchNow: fetchYears } = useFetch<GetStatsRes>();
  const { state: genresRes, fetchNow: fetchGenres } = useFetch<GetStatsRes>();
  React.useEffect(() => {
    fetchYears(`${API_ROOT_URL}/lib/stats/years`);
    fetchGenres(`${API_ROOT_URL}/lib/stats/genres`);
  }, []);

  const { playlist, groups, tracks } = usePlaylist();
  const { handlePlay } = usePlayer();

  //

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
                isOpenGroupId={playlist.isGroupOpen}
                onGetTrack={tracks.handleAdd}
                years={yearsRes}
                genres={genresRes}
              >
                {playlist.tracks[`${groupId}`].map((track: TrackMeta) => {
                  return (
                    <Track
                      {...track}
                      key={`${track.trackId}-${track.duration}`}
                      onRemoveTrack={() =>
                        tracks.handleRemove(groupId, track.trackId)
                      }
                      onReplaceTrack={() =>
                        tracks.handleReplace(groupId, track.trackId)
                      }
                    />
                  );
                })}
              </Group>
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
      <Player isPlaying={false /*playingIndex === */} onPlay={handlePlay} />
    </ErrorBoundary>
  );
}
