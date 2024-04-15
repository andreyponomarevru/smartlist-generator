import * as RTK from "@reduxjs/toolkit";

import { TrackMeta, FilterFormValues } from "../../../types";
import { RootState } from "../../../app/store";

export type Direction = "UP" | "DOWN";
export type TrackToReorder = {
  index: number;
  direction: Direction;
};
export type TrackToReplace = {
  trackId: number;
  formValues: FilterFormValues;
};
interface TempPlaylistState {
  tracks: TrackMeta[];
  isGroupOpen: Record<string, boolean>;
}

const initialState: TempPlaylistState = {
  tracks: [],
  isGroupOpen: {},
};

export const tempPlaylistSlice = RTK.createSlice({
  name: "tempPlaylist",
  initialState,
  reducers: {
    resetTempPlaylist: () => initialState,

    addTempTrack: (state, action: RTK.PayloadAction<{ track: TrackMeta }>) => {
      state.tracks = [...state.tracks, action.payload.track];
    },

    removeTempTrack: (
      state,
      action: RTK.PayloadAction<{ trackId: number }>,
    ) => {
      state.tracks = state.tracks.filter(
        (track) => track.trackId !== action.payload.trackId,
      );
    },

    replaceTempTrack: (
      state,
      action: RTK.PayloadAction<{
        trackId: number;
        newTrack: TrackMeta;
      }>,
    ) => {
      const removedIndex = state.tracks.findIndex(
        (track) => track.trackId === action.payload.trackId,
      );
      const filtered = state.tracks.filter(
        (track) => track.trackId !== action.payload.trackId,
      );

      state.tracks = [
        ...filtered.slice(0, removedIndex),
        action.payload.newTrack,
        ...filtered.slice(removedIndex),
      ];
    },

    reorderTempTrack: (
      state,
      action: RTK.PayloadAction<{
        index: number;
        direction: Direction;
      }>,
    ) => {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.tracks.find(
        (item, index) => index === oldIndex,
      ) as TrackMeta;
      const remainingItems = state.tracks.filter(
        (item, index) => index !== oldIndex,
      );

      state.tracks = [
        ...remainingItems.slice(0, newIndex),
        movedItem,
        ...remainingItems.slice(newIndex),
      ];
    },
  },
});
export const {
  resetTempPlaylist,
  removeTempTrack,
  replaceTempTrack,
  reorderTempTrack,
} = tempPlaylistSlice.actions;

//
// Selectors
//

export function selectTempPlaylist(state: RootState) {
  return state.tempPlaylist;
}

export function selectAllTempTracks(state: RootState) {
  return state.playlist.groups
    .map((groupId) => state.playlist.tracks[groupId])
    .flat();
}

export const tempPlaylistReducer = tempPlaylistSlice.reducer;
