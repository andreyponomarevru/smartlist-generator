import React from "react";
import { TrackMeta, FilterFormValues } from "../../../types";
import { buildSearchQuery } from "../../../utils";
import { useLazyFindTrackQuery } from "../../track";

export type Direction = "UP" | "DOWN";
export type TrackToReorder = {
  index: number;
  direction: Direction;
};
export type TrackToReplace = {
  trackId: number;
  formValues: FilterFormValues;
};

export type State = {
  tracks: TrackMeta[];
};
type Action =
  | { type: "ADD_TRACK"; payload: { track: TrackMeta[] } }
  | { type: "REMOVE_TRACK"; payload: { trackId: number } }
  | { type: "RESET" }
  | {
      type: "REPLACE_TRACK";
      payload: { trackId: number; newTrack: TrackMeta[] };
    }
  | {
      type: "REORDER_TRACK";
      payload: { index: number; direction: Direction };
    };

function playlistReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TRACK": {
      return {
        ...state,
        tracks: [...state.tracks, ...action.payload.track],
      };
    }
    case "RESET": {
      return { ...state, tracks: [] };
    }
    case "REMOVE_TRACK": {
      return {
        ...state,
        tracks: [
          ...state.tracks.filter((track) => {
            return track.trackId !== action.payload.trackId;
          }),
        ],
      };
    }
    case "REPLACE_TRACK": {
      const removedIndex = state.tracks.findIndex(
        (track) => track.trackId === action.payload.trackId,
      );
      const filtered = state.tracks.filter(
        (track) => track.trackId !== action.payload.trackId,
      );
      const updatedTracks = [
        ...filtered.slice(0, removedIndex),
        ...action.payload.newTrack,
        ...filtered.slice(removedIndex),
      ];

      return { ...state, tracks: updatedTracks };
    }
    case "REORDER_TRACK": {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.tracks.find(
        (item, index) => index === oldIndex,
      ) as TrackMeta;
      const remainingItems = state.tracks.filter(
        (item, index) => index !== oldIndex,
      );
      return {
        ...state,
        tracks: [
          ...remainingItems.slice(0, newIndex),
          movedItem,
          ...remainingItems.slice(newIndex),
        ],
      };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function usePlaylist() {
  const initialState: State = { tracks: [] };

  const [state, dispatch] = React.useReducer(playlistReducer, initialState);
  const [findTrack, findTrackResult] = useLazyFindTrackQuery();

  //

  function remove(trackId: number) {
    dispatch({ type: "REMOVE_TRACK", payload: { trackId } });
  }

  function reset() {
    dispatch({ type: "RESET" });
  }

  async function replace({ trackId, formValues }: TrackToReplace) {
    const excludedTracks = Object.values(state.tracks)
      .flat()
      .map((t) => t.trackId);

    try {
      const track = await findTrack({
        formValues,
        excludedTracks,
      }).unwrap();
      dispatch({
        type: "REPLACE_TRACK",
        payload: { trackId, newTrack: track },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function add(formValues: FilterFormValues) {
    const excludedTracks = Object.values(state.tracks)
      .flat()
      .map((t) => t.trackId);

    try {
      const track = await findTrack({
        formValues,
        excludedTracks,
      }).unwrap();
      dispatch({ type: "ADD_TRACK", payload: { track } });
    } catch (err) {
      console.log(err);
    }
  }

  function reorder({ index, direction }: TrackToReorder) {
    dispatch({ type: "REORDER_TRACK", payload: { index, direction } });
  }

  return {
    ...state,
    handleTrackAdd: add,
    handleTrackRemove: remove,
    handleTrackReplace: replace,
    handleTrackReorder: reorder,
    handleTracksReset: reset,
    findTrackResult,
  };
}
