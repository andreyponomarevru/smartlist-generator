import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Navigate } from "react-router";
import { NavLink } from "react-router-dom";
import { useFetch } from "../../../hooks/use-fetch";
import { API_ROOT_URL } from "../../../config/env";
import { ROUTES } from "../../../config/routes";
import {
  GetAllPlaylistsResponse,
  APIResponse,
  NewPlaylist,
  CreateNewPlaylistAPIResponse,
} from "../../../types";
import { Message } from "../../../lib/message/message";

import "./new-playlist-form.scss";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export function NewPlaylistForm(props: Props) {
  const playlistNameRef = useRef<HTMLInputElement>(null);

  const { state: newPlaylist, fetchNow: postPlaylist, resetState } = useFetch<
    CreateNewPlaylistAPIResponse
  >();

  const navigate = useNavigate();
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
      onSubmit={handleSubmit}
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
}
