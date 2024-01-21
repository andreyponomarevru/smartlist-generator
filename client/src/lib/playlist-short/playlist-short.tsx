import React, { useEffect } from "react";
import { Btn } from "../../lib/btn/btn";

import "./playlist-short.scss";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  playlistId: number;
  title: string;
  onDeleteBtnClick: (playlistId: number) => void;
  onEditBtnClick: (playlistId: number) => void;
}

export function PlaylistShort(props: Props) {
  return (
    <div className="playlist-short">
      <div className="playlist-short__title">{props.title}</div>
      <div
        className="btn btn_theme_black playlist-short__edit-btn"
        onClick={() => props.onEditBtnClick(props.playlistId)}
      >
        Edit
      </div>
      <Btn
        className="playlist-short__delete-btn"
        name="Delete"
        theme="red"
        onClick={() => props.onDeleteBtnClick(props.playlistId)}
      />
    </div>
  );
}
