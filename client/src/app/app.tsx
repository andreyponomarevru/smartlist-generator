import React, { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ErrorBoundary } from "../lib/error-boundary/error-boundary";
import { API_ROOT_URL } from "../config/env";
import { useFetch } from "../hooks/use-fetch";
import { PagesMain } from "../pages/main/main";
import { GetStatsRes } from "../types";
import { Loader } from "../lib/loader/loader";
import { Message } from "../lib/message/message";
import { Stats } from "../lib/stats/stats";

import "./app.scss";

export function App() {
  const { state: yearsRes, fetchNow: fetchYears } = useFetch<GetStatsRes>();
  const { state: genresRes, fetchNow: fetchGenres } = useFetch<GetStatsRes>();

  useEffect(() => {
    fetchYears(`${API_ROOT_URL}/lib/stats/years`);
    fetchGenres(`${API_ROOT_URL}/lib/stats/genres`);
  }, []);

  return (
    <ErrorBoundary>
      <main className="app">
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
                {yearsRes.response?.body?.results.reduce(
                  (accumulator, currentValue) =>
                    accumulator + currentValue.count,
                  0
                )}
              </span>
            </li>
          </ul>

          <Stats title="Genres" stats={genresRes} />
          <Stats title="Years" stats={yearsRes} />

          <div className="btn btn_theme_transparent-red app__btn">Reset db</div>
        </div>

        {yearsRes.response?.body?.results &&
          genresRes.response?.body?.results && (
            <PagesMain
              stats={{
                years: yearsRes.response?.body?.results,
                genres: genresRes.response?.body?.results,
              }}
              className="app__main"
            />
          )}
      </main>
    </ErrorBoundary>
  );
}

/*
        {years.response?.body && genres.response?.body &&
        {..stats.body?.results
            .sort((playlistA, playlistB) => playlistB.id - playlistA.id)
            .map((playlist) => {
              return (
                <PlaylistShort
                  playlistId={playlist.id}
                  key={playlist.id}
                  title={playlist.name}
                  onEditBtnClick={handleEditBtnClick}
                  onDeleteBtnClick={handleDeleteBtnClick}
                />
              );
            })}
        </>
          )

*/
