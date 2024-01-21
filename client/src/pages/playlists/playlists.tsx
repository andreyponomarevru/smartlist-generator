import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router";
import { NavLink, UNSAFE_FetchersContext } from "react-router-dom";
import { API_ROOT_URL } from "../../config/env";
import { Message } from "../../lib/message/message";
import { Btn } from "../../lib/btn/btn";
import { useFetch } from "../../hooks/use-fetch";
import { Loader } from "../../lib/loader/loader";
//import {useCreatePlaylist} from "../../hooks/use-create-playlist"
import { GetAllPlaylistsResponse, APIResponse } from "../../types";
import { Playlist } from "../../lib/playlist/playlist";
import { PlaylistShort } from "../../lib/playlist-short/playlist-short";
import { ROUTES } from "../../config/routes";
import { NewPlaylistForm } from "./new-playlist-form/new-playlist-form";

import "./playlists.scss";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function PagesPlaylists(props: Props) {
  const { state: playlists, fetchNow: fetchPlaylists } = useFetch<
    GetAllPlaylistsResponse
  >();
  useEffect(() => {
    fetchPlaylists(`${API_ROOT_URL}/playlists`);
  }, []);

  return (
    <div className={`playlists-page ${props.className || ""}`}>
      <NewPlaylistForm className="playlists-page__new-playlist-form" />

      {playlists.isLoading && <Loader for="page" color="pink" />}
      {playlists.error && (
        <Message type="danger">Something went wrong :(</Message>
      )}
      {playlists.response?.body && (
        <>
          {...playlists.response.body?.results.map((playlist) => {
            return <PlaylistShort title={playlist.name} />;
          })}
        </>
      )}
    </div>
  );
}
