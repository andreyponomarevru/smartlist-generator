import * as RTK from "@reduxjs/toolkit";

import { TrackMeta, FilterFormValues } from "../../../types";
import { RootState } from "../../../app/store";

export type Direction = "UP" | "DOWN";
export type TrackToReorder = {
  index: number;
  direction: Direction;
  groupId: string;
};
export type TrackToReplace = {
  groupId: string;
  trackId: number;
  formValues: FilterFormValues;
};
export type State = {
  groups: string[];
  tracks: Record<string, TrackMeta[]>;
  isGroupOpen: Record<string, boolean>;
};

const initialState: State = {
  groups: [],
  tracks: {},
  isGroupOpen: {},
};

export const playlistSlice = RTK.createSlice({
  name: "playlist",
  initialState,
  reducers: {
    addGroup: {
      prepare: (payload: { insertAt: number }) => {
        return {
          payload: { groupId: RTK.nanoid(), insertAt: payload.insertAt },
        };
      },
      reducer: (
        state,
        action: RTK.PayloadAction<{ groupId: string; insertAt: number }>,
      ) => {
        state.groups = [
          ...state.groups.slice(0, action.payload.insertAt),
          action.payload.groupId,
          ...state.groups.slice(action.payload.insertAt),
        ];
        state.tracks[`${action.payload.groupId}`] = [];
        state.isGroupOpen[`${action.payload.groupId}`] = true;
      },
    },

    destroyGroup: (state, action: RTK.PayloadAction<{ groupId: string }>) => {
      state.groups = state.groups.filter((id) => id !== action.payload.groupId);
      delete state.tracks[`${action.payload.groupId}`];
    },

    resetPlaylist: () => initialState,

    reorderGroup: (
      state,
      action: RTK.PayloadAction<{ index: number; direction: Direction }>,
    ) => {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.groups.find((item, index) => index === oldIndex);
      const remainingItems = state.groups.filter(
        (item, index) => index !== oldIndex,
      );

      if (movedItem) {
        state.groups = [
          ...remainingItems.slice(0, newIndex),
          movedItem,
          ...remainingItems.slice(newIndex),
        ];
      }
    },

    resetGroup: (state, action: RTK.PayloadAction<{ groupId: string }>) => {
      state.tracks[`${action.payload.groupId}`] = [];
    },

    toggleOpenGroup: (
      state,
      action: RTK.PayloadAction<{ groupId: string }>,
    ) => {
      const groupId = action.payload.groupId;
      state.isGroupOpen[groupId] = !state.isGroupOpen[groupId];
    },

    addTrack: (
      state,
      action: RTK.PayloadAction<{ groupId: string; tracks: TrackMeta[] }>,
    ) => {
      state.tracks[`${action.payload.groupId}`].push(...action.payload.tracks);
    },

    removeTrack: (
      state,
      action: RTK.PayloadAction<{ groupId: string; trackId: number }>,
    ) => {
      const { groupId, trackId } = action.payload;
      state.tracks[`${groupId}`] = state.tracks[`${groupId}`].filter(
        (track) => track.trackId !== trackId,
      );
    },

    replaceTrack: (
      state,
      action: RTK.PayloadAction<{
        groupId: string;
        trackId: number;
        newTracks: TrackMeta[];
      }>,
    ) => {
      const removeIndex = state.tracks[`${action.payload.groupId}`].findIndex(
        (track) => track.trackId === action.payload.trackId,
      );

      state.tracks[`${action.payload.groupId}`].splice(
        removeIndex,
        action.payload.newTracks.length,
        ...action.payload.newTracks,
      );
    },

    reorderTrack: (
      state,
      action: RTK.PayloadAction<{
        index: number;
        direction: Direction;
        groupId: string;
      }>,
    ) => {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.tracks[`${action.payload.groupId}`].find(
        (item, index) => index === oldIndex,
      ) as TrackMeta;
      const remainingItems = state.tracks[`${action.payload.groupId}`].filter(
        (item, index) => index !== oldIndex,
      );

      state.tracks[`${action.payload.groupId}`] = [
        ...remainingItems.slice(0, newIndex),
        movedItem,
        ...remainingItems.slice(newIndex),
      ];
    },
  },
});
export const {
  addGroup,
  destroyGroup,
  resetPlaylist,
  reorderGroup,
  toggleOpenGroup,
  addTrack,
  removeTrack,
  resetGroup,
  replaceTrack,
  reorderTrack,
} = playlistSlice.actions;

//
// Selectors
//

export function selectPlaylist(state: RootState) {
  return state.playlist;
}

export const selectGroups = RTK.createSelector([selectPlaylist], (playlist) => {
  return playlist.groups;
});

export const selectTracks = RTK.createSelector(
  [selectPlaylist, selectGroups],
  (playlist, groups) => {
    return groups.map((groupId) => playlist.tracks[groupId]).flat();
  },
);

export function selectTracksFromGroup(state: RootState, groupId: string) {
  return state.playlist.tracks[groupId];
}

export function selectIsGroupOpen(state: RootState, groupId: string) {
  return state.playlist.isGroupOpen[groupId];
}

export const playlistReducer = playlistSlice.reducer;
