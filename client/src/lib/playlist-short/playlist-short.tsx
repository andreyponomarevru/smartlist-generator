import React, { useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { Btn } from "../../lib/btn/btn";
import { useFetch } from "../../hooks/use-fetch";
import { GetPlaylistResponse } from "../../types";
import { API_ROOT_URL } from "../../config/env";
import { ROUTES } from "../../config/routes";

import "./playlist-short.scss";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  playlistId: number;
  title: string;
}

export function PlaylistShort(props: Props) {
  const navigate = useNavigate();

  const { state: playlist, fetchNow: fetchPlaylist } = useFetch<
    GetPlaylistResponse
  >();

  function handleEditBtnClick() {
    fetchPlaylist(`${API_ROOT_URL}/playlists/${props.playlistId}`);
  }

  useEffect(() => {
    playlist.response &&
      navigate(ROUTES.playlist, {
        state: playlist.response.body?.results,
      });
  }, [playlist]);

  function handleDeleteBtnClick() {}

  return (
    <div className="playlist-short">
      <div className="playlist-short__title">{props.title}</div>
      <div
        className="btn btn_theme_black playlist-short__edit-btn"
        onClick={handleEditBtnClick}
      >
        Edit
      </div>
      <Btn
        className="playlist-short__delete-btn"
        name="Delete"
        theme="red"
        onClick={handleDeleteBtnClick}
      />
    </div>
  );
}
