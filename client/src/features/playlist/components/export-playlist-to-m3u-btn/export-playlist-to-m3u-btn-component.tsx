import React from "react";
import { FaDownload } from "react-icons/fa";

import { encodeRFC3986URIComponent } from "../../../../utils";
import { TrackMeta } from "../../../../types";

type ExportPlaylistToM3UBtnProps = {
  playlistName: string;
  tracks: TrackMeta[];
  tracksTotal: number;
};

export function ExportPlaylistToM3UBtn(props: ExportPlaylistToM3UBtnProps) {
  return (
    <button
      type="button"
      onClick={() => exportPlaylistToM3U(props.playlistName, props.tracks)}
      className="btn btn_type_secondary"
      disabled={props.tracksTotal === 0}
    >
      <FaDownload className="icon" />
      Export as M3U
    </button>
  );
}

export function exportPlaylistToM3U(playlistName: string, tracks: TrackMeta[]) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#PLAYLIST:${playlistName}\n\n${tracks
      .map((t) => `file://${encodeRFC3986URIComponent(t.filePath)}`)
      .join("\n")}`,
  )}`;
  link.download = `${playlistName}.m3u`;
  link.click();
}
