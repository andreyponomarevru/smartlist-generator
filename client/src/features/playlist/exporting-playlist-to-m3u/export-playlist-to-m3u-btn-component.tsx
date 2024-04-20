import React from "react";
import { FaDownload } from "react-icons/fa";

import { encodeRFC3986URIComponent } from "../../../utils";
import { Btn } from "../../../features/ui/btn";
import { TrackMeta } from "../../../types";

export function exportPlaylistToM3U(
  playlistName: string,
  tracks: { filePath: string }[],
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#PLAYLIST:${playlistName}\n\n${tracks
      .map((t) => `file://${encodeRFC3986URIComponent(t.filePath)}`)
      .join("\n")}`,
  )}`;
  link.download = `${playlistName}.m3u`;
  link.click();
}

interface Props {
  isDisabled: boolean;
  playlistName: string;
  tracks: TrackMeta[];
}

export function ExportPlaylistToM3UBtn(props: Props) {
  return (
    <Btn
      onClick={() => exportPlaylistToM3U(props.playlistName, props.tracks)}
      isDisabled={props.isDisabled}
      className="btn_type_secondary"
    >
      <FaDownload className="icon" />
      Export as M3U
    </Btn>
  );
}
