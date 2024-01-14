import React, { useState } from "react";
import { Subplaylist } from "../subplaylist/subplaylist";
import { TrackMeta } from "../../types";
import { Btn } from "../btn/btn";

import "./playlist.scss";

interface Props {
  className?: string;
  id: number;
  title: string;
  isOpened: boolean;
  onClick: () => void;
}

function Playlist(props: Props) {
  const [isLocked, setIsLocked] = useState<boolean>(false);

  const className = props.className || "";

  const apiResponse = [
    "Opener",
    "Dub",
    "Ambient Downtempo",
    "Beatless Ambient",
    "Jungle Breakbeat",
    "Electro",
    "Indie Soul Psy Rock",
    "Dance",
    "World Music",
    "Any Old",
  ];

  return (
    <div className={`playlist ${className}`} onClick={props.onClick}>
      <header className="playlist__header">
        <span className="playlist__title">Playlist-01-01-2001-11:11:11</span>
        <Btn
          className="playlist__lock-btn"
          name={isLocked ? "LOCKED" : "UNLOCKED"}
          theme="transparent-black"
          onClick={() => setIsLocked(!isLocked)}
        />
        <span className="playlist__length">~ 72 min.</span>
      </header>

      {props.isOpened && (
        <>
          {...apiResponse.map((subplaylist) => {
            return <Subplaylist name={subplaylist} />;
          })}

          <nav className="playlist__navbar">
            <Btn
              className="playlist__navbar-btn1"
              name="Reset"
              theme="transparent-red"
            />
            <Btn
              className="playlist__navbar-btn2"
              name="Delete"
              theme="transparent-red"
            />
            <Btn
              className="playlist__navbar-btn3"
              name="Download as .M3U"
              theme="transparent-black"
            />
          </nav>
        </>
      )}
    </div>
  );
}

export { Playlist };
