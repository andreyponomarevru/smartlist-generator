import React from "react";
import { TrackMeta, FilterFormValues } from "../types";
import { buildSearchQuery } from "../utils/misc";
import { useTrack } from "./api/use-track";

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
  isGroupOpen: boolean;
};
type Action =
  | { type: "ADD_TRACK"; payload: { track: TrackMeta[] } }
  | { type: "REMOVE_TRACK"; payload: { trackId: number } }
  | { type: "RESET"; payload: { isGroupOpen?: boolean } }
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
      return {
        ...state,
        tracks: [],
        isGroupOpen: !!action.payload.isGroupOpen,
      };
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
  const initialState: State = {
    tracks: [],
    isGroupOpen: false,
  };

  const [state, dispatch] = React.useReducer(playlistReducer, initialState);
  const getTrackQuery = useTrack();

  //

  function remove(trackId: number) {
    dispatch({ type: "REMOVE_TRACK", payload: { trackId } });
  }

  function reset(isGroupOpen = false) {
    dispatch({ type: "RESET", payload: { isGroupOpen } });
  }

  async function replace({ trackId, formValues }: TrackToReplace) {
    try {
      const track = await getTrackQuery.mutateAsync(
        buildSearchQuery(formValues, [
          ...Object.values(state.tracks)
            .flat()
            .map((t) => t.trackId),
        ]),
      );
      dispatch({
        type: "REPLACE_TRACK",
        payload: { trackId, newTrack: track },
      });
    } catch (err) {
      console.error(getTrackQuery.error);
    }
  }

  async function add(formValues: FilterFormValues) {
    try {
      const excludedTracks = Object.values(state.tracks)
        .flat()
        .map((t) => t.trackId);

      dispatch({
        type: "ADD_TRACK",
        payload: {
          track: await getTrackQuery.mutateAsync(
            buildSearchQuery(formValues, excludedTracks),
          ),
        },
      });
    } catch (err) {
      console.error(err);
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
    handleReset: reset,
  };
}
