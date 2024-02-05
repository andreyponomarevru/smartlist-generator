import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { API_ROOT_URL } from "../config/env";
import { useFetch } from "../hooks/use-fetch";
import { GetStatsRes, APIResponse, FormValues, GetTrackRes } from "../types";
import { Loader } from "../lib/loader/loader";
import { Message } from "../lib/message/message";
import { Stats } from "../lib/stats/stats";
import { Btn } from "../lib/btn/btn";
import { toHoursMinSec } from "../utils/misc";
import { Group } from "../lib/group/group";
import { buildQuery } from "../utils/misc";
import { Sidebar } from "../lib/sidebar/sidebar";

import "./app.scss";

export function App() {
  const { state: yearsRes, fetchNow: fetchYears } = useFetch<GetStatsRes>();
  const { state: genresRes, fetchNow: fetchGenres } = useFetch<GetStatsRes>();
  useEffect(() => {
    fetchYears(`${API_ROOT_URL}/lib/stats/years`);
    fetchGenres(`${API_ROOT_URL}/lib/stats/genres`);
  }, []);

  // Move code below to hook with reducer
  const [groups, setGroups] = useState<any>([
    {
      name: new Date().toLocaleTimeString(),
      tracks: [],
    },
  ]);
  function handleAddGroup(index: number) {
    const groupsCopy = [...groups];
    groupsCopy.splice(index + 1, 0, {
      name: new Date().toLocaleTimeString(),
      tracks: [],
    });
    setGroups(groupsCopy);
  }
  function handleDeleteGroup(index: number) {
    const groupsCopy = [...groups];
    groupsCopy.splice(index, 1);
    setGroups(groupsCopy);
  }
  function handleResetBtnClick() {
    setGroups([{ name: new Date().toLocaleTimeString(), tracks: [] }]);
  }

  //

  const { state: trackRes, fetchNow: fetchTrack } = useFetch<GetTrackRes>();
  function handleSubmit(data: FormValues) {
    console.log("app.tsx [handleSubmit]", data);
    const searchQuery = {
      operator: data.operator.value,
      filters: buildQuery(data.filters),
      excludeTracks: [],
    };
    console.log("trackSearchQuery = ", searchQuery);

    fetchTrack(`${API_ROOT_URL}/tracks`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(searchQuery),
    });
  }
  React.useEffect(() => {
    if (trackRes.response?.body?.results) {
      setGroups([
        { name: groups.name, tracks: [...trackRes.response.body.results] },
      ]);
    }

    return () => {
      console.log("groups", groups);
    };
  }, [trackRes]);

  //

  // Move into usePlyer hook

  const [playingIndex, setPlayingIndex] = useState(0);

  function handlePlayBtnClick() {
    //setIsPlaying((s) => !s);
  }

  /*const { state, fetchNow, resetState } = useFetch<
    GetTrackFromSubplaylistAPIResponse
  >();*/

  function handleRollBtnClick() {
    /*fetchNow(
      `${API_ROOT_URL}/lib/subplaylists?id=1&limit=2&exclude=1&exclude=2&exclude=3`
    );*/
  }

  return (
    <ErrorBoundary>
      <main className="app">
        <Sidebar stats={{ years: yearsRes, genres: genresRes }} />

        <div className="app__main">
          <div className="app__header">
            <a className="app__logo" href="/">
              Smartlist Generator
            </a>
            <div className="app__controls app__controls_top">
              <Btn
                onClick={handleResetBtnClick}
                className="app__btn"
                name="Reset"
                theme="transparent-red"
              />
              <div></div>
              <Btn
                className="app__btn"
                name="Import blacklisted tracks"
                theme="transparent-black"
              />
              <Btn
                className="app__btn"
                name="Import JSON playlist template"
                theme="transparent-black"
              />
            </div>
          </div>

          <header className="app__playlist-header">
            <div className="app__title">
              Playlist {new Date().toDateString()}
            </div>
            <div className="app__duration">
              {toHoursMinSec(
                groups.reduce(
                  (accum: any, current: any) =>
                    accum +
                    current.tracks.reduce(
                      (accum: any, current: any) => accum + current.duration,
                      0
                    ),
                  0
                )
              )}
            </div>
          </header>

          {yearsRes.response?.body?.results && genresRes.response?.body?.results
            ? groups.map((group: any, index: number) => {
                return (
                  <Group
                    key={index}
                    stats={{
                      years: yearsRes.response?.body?.results!,
                      genres: genresRes.response?.body?.results!,
                    }}
                    name={group.name}
                    tracks={group.tracks}
                    isDeleteGroupBtnDisabled={groups.length === 1}
                    onPlayBtnClick={handlePlayBtnClick}
                    isPlaying={false /*playingIndex === */}
                    handleSubmit={handleSubmit}
                    handleAddGroup={() => handleAddGroup(index)}
                    handleDeleteGroup={() => handleDeleteGroup(index)}
                  />
                );
              })
            : []}

          <nav className="app__controls app__controls_bottom">
            <Btn
              className="app__btn"
              name="Export playlist as M3U"
              theme="transparent-black"
            />
            <Btn
              className="app__btn"
              name="Export playlist as JSON"
              theme="transparent-black"
            />
            <div></div>
            <Btn
              className="app__btn"
              name="Export filters as JSON template"
              theme="transparent-black"
            />
          </nav>
        </div>
      </main>
    </ErrorBoundary>
  );
}
