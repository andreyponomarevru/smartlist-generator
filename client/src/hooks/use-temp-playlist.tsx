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
  excludedTracks: Set<number>;
};
type Action =
  | { type: "RESET" }
  | { type: "ADD_TRACK"; payload: { tracks: TrackMeta[] } }
  | { type: "REMOVE_TRACK"; payload: { trackId: number } }
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
        tracks: [...state.tracks, ...action.payload.tracks],
      };
    }
    case "RESET": {
      return { ...state, tracks: [], excludedTracks: state.excludedTracks };
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

export function useTempPlaylist() {
  const initialState: State = {
    tracks: [],
    excludedTracks: new Set<number>(),
  };

  function getInitialState() {
    const savedExcludedTracks = localStorage.getItem("excludedTracks");
    if (savedExcludedTracks !== null) {
      return {
        ...initialState,
        excludedTracks: JSON.parse(savedExcludedTracks),
      };
    } else {
      return initialState;
    }
  }

  const [state, dispatch] = React.useReducer(
    playlistReducer,
    initialState,
    getInitialState,
  );
  const getTrackQuery = useTrack();

  React.useEffect(() => {
    localStorage.setItem(
      "excludedTracks",
      JSON.stringify([...state.excludedTracks]),
    );
  }, [state.excludedTracks]);

  function reset() {
    dispatch({ type: "RESET" });
  }

  //

  function removeTrack(trackId: number) {
    dispatch({ type: "REMOVE_TRACK", payload: { trackId } });
  }

  async function replaceTrack({ trackId, formValues }: TrackToReplace) {
    try {
      const track = await getTrackQuery.mutateAsync(
        buildSearchQuery(formValues, [
          ...Object.values(state.tracks)
            .flat()
            .map((t) => t.trackId),
          ...state.excludedTracks,
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

  async function addTrack(inputs: FilterFormValues) {
    try {
      const track = await getTrackQuery.mutateAsync(
        buildSearchQuery(inputs, [
          ...Object.values(state.tracks)
            .flat()
            .map((t) => t.trackId),
          ...state.excludedTracks,
        ]),
      );
      dispatch({ type: "ADD_TRACK", payload: { tracks: track } });
    } catch (err) {
      console.error(err);
    }
  }

  //

  function reorderTracks({ index, direction }: TrackToReorder) {
    dispatch({ type: "REORDER_TRACK", payload: { index, direction } });
  }

  return {
    ...state,
    handleReset: reset,
    handleAddTrack: addTrack,
    handleRemoveTrack: removeTrack,
    handleReplaceTrack: replaceTrack,
    handleReorderTracks: reorderTracks,
  };
}
