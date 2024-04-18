import * as RTK from "@reduxjs/toolkit";

import { TrackMeta } from "../../../../types";

export interface PlayerState {
  activeTrack?: TrackMeta | null;
  isPlaying?: boolean;
  src?: string;
}
