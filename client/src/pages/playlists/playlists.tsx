import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router";
import { NavLink, UNSAFE_FetchersContext } from "react-router-dom";
import { API_ROOT_URL } from "../../config/env";
import { Message } from "../../lib/message/message";
import { Btn } from "../../lib/btn/btn";
import { useFetch } from "../../hooks/use-fetch";
import { Loader } from "../../lib/loader/loader";
import {
  GetAllPlaylistsResponse,
  GetPlaylistResponse,
  APIResponse,
} from "../../types";
import { Playlist } from "../../lib/playlist/playlist";
import { PlaylistShort } from "../../lib/playlist-short/playlist-short";
import { ROUTES } from "../../config/routes";
import { NewPlaylistForm } from "./new-playlist-form/new-playlist-form";

import "./playlists.scss";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function PagesPlaylists(props: Props) {
  const navigate = useNavigate();
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
  }, [deletedPlaylist]);

  return (
    <div className={`playlists-page ${props.className || ""}`}>
      <NewPlaylistForm className="playlists-page__new-playlist-form" />

      {playlists.isLoading && <Loader for="page" color="pink" />}
      {playlists.error && (
        <Message type="danger">Something went wrong :(</Message>
      )}
      {playlists.response?.body && (
        <>
          {...playlists.response.body?.results
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
      )}
    </div>
  );
}
