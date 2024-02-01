import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { API_ROOT_URL } from "../config/env";
import { useFetch } from "../hooks/use-fetch";
import { GetStatsRes, APIResponse } from "../types";
import { Loader } from "../lib/loader/loader";
import { Message } from "../lib/message/message";
import { Stats } from "../lib/stats/stats";
import { Btn } from "../lib/btn/btn";
import { toHoursMinSec } from "../utils/misc";
import { Group } from "../lib/group/group";

import "./app.scss";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  stats: {
    years: APIResponse<GetStatsRes>;
    genres: APIResponse<GetStatsRes>;
  };
}

function Sidebar(props: SidebarProps) {
  return (
    <div className="app__sidebar">
      <a className="app__logo" href="/">
        Smartlist Generator
      </a>
      <ul>
        <li className="app__row">
          <span className="app__header">Database</span>
          <span className="app__details">{new Date().toDateString()}</span>
        </li>
        <li className="app__row">
          <span className="app__header">Tracks</span>
          <span className="app__details">
            {props.stats.years.response?.body?.results.reduce(
              (accumulator, currentValue) => accumulator + currentValue.count,
              0
            )}
          </span>
        </li>
      </ul>

      <Stats title="Genres" stats={props.stats.genres} />
      <Stats title="Years" stats={props.stats.years} />

      <div className="btn btn_theme_transparent-red app__btn">Reset db</div>
    </div>
  );
}

export function App() {
  const { state: yearsRes, fetchNow: fetchYears } = useFetch<GetStatsRes>();
  const { state: genresRes, fetchNow: fetchGenres } = useFetch<GetStatsRes>();
  useEffect(() => {
    fetchYears(`${API_ROOT_URL}/lib/stats/years`);
    fetchGenres(`${API_ROOT_URL}/lib/stats/genres`);
  }, []);

  // Move code below to hook with reducer

  const [groups, setGroups] = useState([
    {
      name: "Opener",
      settings: {
        operator: "AND",
        filters: [
          { name: "year", rule: "greater than or equal", value: 2019 },
          { name: "genre", rule: "contains all", value: [50] },
        ],
      },
      tracks: [
        {
          trackId: 1,
          position: 1,
          artist: ["The Future Sound of London"],
          title: "Papua New Guinea",
          duration: 828,
          year: 1991,
          genre: ["Breakeat", "Ambient"],
          genreId: [1, 2],
        },
        {
          trackId: 2,
          position: 1,
          artist: ["The Future Sound of London"],
          title: "Papua New Guinea",
          duration: 728,
          year: 1991,
          genre: ["Breakeat", "Ambient"],
          genreId: [1, 2],
        },
      ],
    },
    {
      name: "Opener",
      settings: {
        operator: "AND",
        filters: [
          { name: "year", rule: "greater than or equal", value: 2019 },
          { name: "genre", rule: "contains all", value: [50] },
        ],
      },
      tracks: [
        {
          trackId: 4,
          position: 1,
          artist: ["The Future Sound of London"],
          title: "Papua New Guinea",
          duration: 728,
          year: 1991,
          genre: ["Breakeat", "Ambient"],
          genreId: [1, 2],
        },
        {
          trackId: 5,
          position: 1,
          artist: ["The Future Sound of London"],
          title: "Papua New Guinea",
          duration: 728,
          year: 1991,
          genre: ["Breakeat", "Ambient"],
          genreId: [1, 2],
        },
      ],
    },
  ]);

  //

  const [playlist, setPlaylist] = useState([]);

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
          <div className="app__controls app__controls_top">
            <Btn className="app__btn" name="Reset" theme="transparent-red" />
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

          <header className="app__playlist-header">
            <div className="app__title">
              Playlist {new Date().toDateString()}
            </div>
            <div className="app__duration">
              {toHoursMinSec(
                groups.reduce(
                  (accum, current) =>
                    accum +
                    current.tracks.reduce(
                      (accum, current) => accum + current.duration,
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
                    title="Your playlist title"
                    stats={{
                      years: yearsRes.response?.body?.results!,
                      genres: genresRes.response?.body?.results!,
                    }}
                    group={group}
                    onPlayBtnClick={handlePlayBtnClick}
                    isPlaying={false /*playingIndex === */}
                  />
                );
              })
            : []}

          <nav className="app__controls app__controls_down">
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

/*
  const { state: playlist, fetchNow: fetchPlaylist } = useFetch<
    GetPlaylistResponse
  >();
  function handleEditBtnClick(playlistId: number) {
    fetchPlaylist(`${API_ROOT_URL}/playlists/${playlistId}`);
  }
  useEffect(() => {
    playlist.response &&
      navigate(ROUTES.playlist, {
        state: playlist.response.body?.results,
      });
  }, [playlist]);

  // TODO refactor everything related to managing playlists into hook with useReducer
  const { state: playlists, fetchNow: fetchPlaylists } = useFetch<
    GetAllPlaylistsResponse
  >();
  useEffect(() => {
    fetchPlaylists(`${API_ROOT_URL}/playlists`);
  }, []);

  //

  const { state: deletedPlaylist, fetchNow: deletePlaylist } = useFetch();
  function handleDeleteBtnClick(playlistId: number) {
    console.log("PLAYLUST ID = ", playlistId);
    deletePlaylist(`${API_ROOT_URL}/playlists/${playlistId}`, {
      method: "DELETE",
    });
  }
  useEffect(() => {
    if (deletedPlaylist.response?.status === 204) {
      fetchPlaylists(`${API_ROOT_URL}/playlists`);
    }
  }, [deletedPlaylist]);*/

//

/*
  import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useFetch } from "../../../hooks/use-fetch";
import { API_ROOT_URL } from "../../../config/env";
import { Message } from "../../../lib/message/message";

import "./new-playlist-form.scss";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function NewPlaylistForm(props: Props) {
  const playlistNameRef = useRef<HTMLInputElement>(null);
  
  //const { state: newPlaylist, fetchNow: postPlaylist, resetState } = useFetch<
  //  CreateNewPlaylistAPIResponse
  //>();

  //const navigate = useNavigate();

  const [input, setInput] = useState("");
  
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const playlistName = input.trim();
    if (playlistName.length > 0 && playlistName.length < 255) {
      postPlaylist(`${API_ROOT_URL}/playlists`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ name: playlistName }),
      });
    } else {
      playlistNameRef.current?.focus();
    }
  }

    useEffect(() => {
    newPlaylist.response &&
      navigate(ROUTES.playlist, { state: newPlaylist.response.body?.results });
  }, [newPlaylist]);

  return (
    <form
      className={`new-playlist-form ${props.className || ""}`}
      onSubmit={() => {}}
    >
      <label className="new-playlist-form__label" htmlFor="playlist-name" />
      <input
        ref={playlistNameRef}
        id="playlist-name"
        className="new-playlist-form__input"
        type="text"
        maxLength={255}
        minLength={1}
        name="playlist-name"
        autoComplete="off"
        placeholder="Type a new playlist name..."
        value={input}
        onClick={() => {
          if (newPlaylist.error) resetState();
        }}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setInput(e.target.value);
        }}
      />
      <button
        className="new-playlist-form__btn btn btn_theme_black"
        type="submit"
        name="playlist-name"
        value=""
      >
        Create new playlist
      </button>
      {newPlaylist.error && (
        <Message type="danger">A{newPlaylist.error.message}</Message>
      )}
    </form>
  );
}*/
