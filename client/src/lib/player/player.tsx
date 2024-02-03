import React, { useState, useEffect } from "react";
import { TrackMeta } from "../../types";
import { Btn } from "../btn/btn";

import "./player.scss";

interface PlayerProps extends React.HTMLAttributes<HTMLLIElement> {
  isPlaying: boolean;
  onPlayBtnClick: () => void;
}

export function Player(props: PlayerProps & TrackMeta) {
  return (
    <li key={props.trackId} className="group__track">
      <span className="group__year">{props.year}</span>
      <span className="group__artist">{props.artist}</span>
      <span className="group__title">{props.title}</span>
      <div className="group__player">
        <div
          className="group__toggle-play-btn"
          onClick={() => props.onPlayBtnClick()}
        >
          {props.isPlaying ? "S" : "P"}
        </div>
        <div className="group__progressbar"></div>
        <div className="group__duration">08:12</div>
      </div>
      <Btn name="Pick another" className="group__btn" theme="black" />
      <span className="btn btn_theme_black group__btn">−</span>
      <button
        type="submit"
        form="filter-form"
        disabled={false}
        className="btn btn_theme_black group_btn"
      >
        +
      </button>
    </li>
  );
}
