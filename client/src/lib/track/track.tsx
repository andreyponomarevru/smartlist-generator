import React, { useState, useEffect } from "react";
import { TrackMeta } from "../../types";
import { Btn } from "../btn/btn";
import { toHoursMinSec } from "../../utils/misc";

import "./track.scss";

interface TrackProps extends React.HTMLAttributes<HTMLLIElement> {}

export function Track(props: TrackProps & TrackMeta) {
  return (
    <li key={props.trackId} className="track">
      <span className="track__year">{props.year}</span>
      <span className="track__artist-and-title">
        <span className="track__artists">{props.artist.join(", ")}</span>
        <span className="track__title">{props.title}</span>
      </span>
      <span className="track__genres">
        {props.genre.map((name) => (
          <span key={name} className="track__genre">
            {name}
          </span>
        ))}
      </span>
      <span className="track__duration">{toHoursMinSec(props.duration)}</span>
      <div className="track__controls">{props.children}</div>
    </li>
  );
}
