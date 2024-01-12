import React from "react";
import { Track } from "../track/track";
import { Btn } from "../btn/btn";

import "./subplaylist.scss";

const { REACT_APP_API_ROOT } = process.env;

interface SubplaylistProps {
  name: string;
}

function Subplaylist(props: SubplaylistProps) {
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
        <Btn className="subplaylist__btn1" name="Reset" theme="white" />
        <Btn className="subplaylist__btn2" name="Roll the dice" theme="white" />
      </header>
      <div className="subplaylist__list">
        {apiResponse.map((track) => (
          <Track meta={track} />
        ))}
      </div>
    </div>
  );
}

export { Subplaylist };
