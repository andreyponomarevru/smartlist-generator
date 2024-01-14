import React, { useState } from "react";
import { Track } from "../track/track";
import { SmallBtn } from "../small-btn/small-btn";

import "./subplaylist.scss";

const { REACT_APP_API_ROOT } = process.env;

interface Props {
  name: string;
}

function Subplaylist(props: Props) {
  const apiResponse = [
    {
      year: 2001,
      artist: ["Carbon Based Lifeforms"],
      title: "World of Sleepers",
      length: "03:42",
    },
    {
      year: 2023,
      artist: ["Larry Heard"],
      title: "Closer to the sun",
      length: "04:28",
    },
    {
      year: 1993,
      artist: ["Deep Space Network", "Pete Namlook"],
      title: "Silence",
      length: "09:54",
    },
  ];

  return (
    <div className="subplaylist">
      <header className="subplaylist__header">
        <h3 className="subplaylist__name">{props.name}</h3>
        <SmallBtn className="subplaylist__btn1" name="Reset" theme="white" />
        <SmallBtn
          className="subplaylist__btn2"
          name="Roll the dice"
          theme="white"
        />
      </header>
      <ul className="subplaylist__list">
        {apiResponse.map((track) => (
          <Track meta={track} />
        ))}
      </ul>
    </div>
  );
}

export { Subplaylist };
