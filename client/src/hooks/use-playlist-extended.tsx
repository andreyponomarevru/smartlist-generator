import React from "react";
import { TrackMeta, FilterFormValues } from "../types";
import {
  buildSearchQuery,
  m3uToFilePaths,
  readFileAsString,
} from "../utils/misc";
import { useEditableText } from "./use-editable-text";
import { useTrack } from "./api/use-track";
import { useTrackIds } from "./api/use-track-ids";

export type Direction = "UP" | "DOWN";
export type TrackToReorder = {
  index: number;
  direction: Direction;
  groupId: number;
};
export type TrackToReplace = {
  groupId: number;
  trackId: number;
  formValues: FilterFormValues;
};

export type State = {
  groups: number[];
  tracks: Record<string, TrackMeta[]>;
  excludedTracks: Set<number>;
  isGroupOpen: Record<string, boolean>;
};
type Action =
  | { type: "ADD_GROUP"; payload: { insertAt: number } }
  | { type: "DESTROY_GROUP"; payload: { groupId: number } }
  | { type: "RESET_PLAYLIST" }
  | {
      type: "REORDER_GROUP";
      payload: { index: number; direction: Direction };
    }
  | { type: "OPEN_GROUP"; payload: { groupId: number } }
  | { type: "ADD_TRACK"; payload: { groupId: number; tracks: TrackMeta[] } }
  | { type: "REMOVE_TRACK"; payload: { groupId: number; trackId: number } }
  | { type: "RESET_TRACKS"; payload: { groupId: number } }
  | {
      type: "REPLACE_TRACK";
      payload: { groupId: number; trackId: number; newTrack: TrackMeta[] };
    }
  | {
      type: "REORDER_TRACK";
      payload: { index: number; direction: Direction; groupId: number };
    }
  | { type: "IMPORT_BLACKLISTED_TRACKS"; payload: { trackIds: number[] } };

let counter = 0;

function playlistReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_GROUP": {
      const newGroupId = ++counter;
      return {
        ...state,
        groups: [
          ...state.groups.slice(0, action.payload.insertAt),
          newGroupId,
          ...state.groups.slice(action.payload.insertAt),
        ],
        tracks: { ...state.tracks, [`${newGroupId}`]: [] },
        isGroupOpen: { ...state.isGroupOpen, [`${newGroupId}`]: true },
      };
    }
    case "ADD_TRACK": {
      const updatedTracks = [
        ...(state.tracks[`${action.payload.groupId}`] || []),
        ...(action.payload.tracks || []),
      ];

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [`${action.payload.groupId}`]: updatedTracks,
        },
      };
    }
    case "DESTROY_GROUP": {
      const { [`${action.payload.groupId}`]: _, ...updatedTracks } =
        state.tracks;

      return {
        ...state,
        groups: state.groups.filter((id) => id !== action.payload.groupId),
        tracks: updatedTracks,
      };
    }
    case "RESET_PLAYLIST": {
      return {
        ...state,
        groups: [],
        tracks: {},
        excludedTracks: state.excludedTracks,
        isGroupOpen: {},
      };
    }
    case "RESET_TRACKS": {
      return {
        ...state,
        tracks: { ...state.tracks, [`${action.payload.groupId}`]: [] },
      };
    }
    case "REMOVE_TRACK": {
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [`${action.payload.groupId}`]: state.tracks[
            `${action.payload.groupId}`
          ].filter((track) => {
            return track.trackId !== action.payload.trackId;
          }),
        },
      };
    }
    case "REPLACE_TRACK": {
      const removedIndex = state.tracks[`${action.payload.groupId}`].findIndex(
        (track) => track.trackId === action.payload.trackId,
      );
      const filtered = state.tracks[`${action.payload.groupId}`].filter(
        (track) => track.trackId !== action.payload.trackId,
      );
      const updatedTracks = [
        ...filtered.slice(0, removedIndex),
        ...action.payload.newTrack,
        ...filtered.slice(removedIndex),
      ];

      return {
        ...state,
        tracks: {
          ...state.tracks,
          [`${action.payload.groupId}`]: updatedTracks,
        },
      };
    }
    case "IMPORT_BLACKLISTED_TRACKS": {
      return {
        ...state,
        groups: [],
        tracks: {},
        excludedTracks: new Set([
          ...state.excludedTracks,
          ...action.payload.trackIds,
        ]),
        isGroupOpen: {},
      };
    }
    case "OPEN_GROUP": {
      return {
        ...state,
        isGroupOpen: {
          ...state.isGroupOpen,
          [`${action.payload.groupId}`]:
            !state.isGroupOpen[`${action.payload.groupId}`],
        },
      };
    }
    case "REORDER_GROUP": {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.groups.find(
        (item, index) => index === oldIndex,
      ) as number;
      const remainingItems = state.groups.filter(
        (item, index) => index !== oldIndex,
      );

      return {
        ...state,
        groups: [
          ...remainingItems.slice(0, newIndex),
          movedItem,
          ...remainingItems.slice(newIndex),
        ],
      };
    }
    case "REORDER_TRACK": {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.tracks[`${action.payload.groupId}`].find(
        (item, index) => index === oldIndex,
      ) as TrackMeta;
      const remainingItems = state.tracks[`${action.payload.groupId}`].filter(
        (item, index) => index !== oldIndex,
      );
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [`${action.payload.groupId}`]: [
            ...remainingItems.slice(0, newIndex),
            movedItem,
            ...remainingItems.slice(newIndex),
          ],
        },
      };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function usePlaylist() {
  const initialState: State = {
    groups: [],
    tracks: {},
    excludedTracks: new Set<number>(),
    isGroupOpen: {},
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
  const playlistName = useEditableText(`Playlist ${new Date().toDateString()}`);
  const getTrackQuery = useTrack();
  const getTrackIdsQuery = useTrackIds();

  React.useEffect(() => {
    localStorage.setItem(
      "excludedTracks",
      JSON.stringify([...state.excludedTracks]),
    );
  }, [state.excludedTracks]);

  function handleGroupAdd(insertAt = 0) {
    dispatch({ type: "ADD_GROUP", payload: { insertAt } });
  }

  function handleGroupRemove(groupId: number) {
    dispatch({ type: "DESTROY_GROUP", payload: { groupId } });
  }

  function handlePlaylistReset() {
    dispatch({ type: "RESET_PLAYLIST" });
  }

  //

  function handleTrackRemove(groupId: number, trackId: number) {
    dispatch({ type: "REMOVE_TRACK", payload: { groupId, trackId } });
  }

  function handleTracksReset(groupId: number) {
    dispatch({ type: "RESET_TRACKS", payload: { groupId } });
  }

  async function handleTrackReplace({
    groupId,
    trackId,
    formValues,
  }: TrackToReplace) {
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
        payload: { groupId, trackId, newTrack: track },
      });
    } catch (err) {
      console.error(getTrackQuery.error);
    }
  }

  async function handleTrackAdd(groupId: number, formValues: FilterFormValues) {
    try {
      const track = await getTrackQuery.mutateAsync(
        buildSearchQuery(formValues, [
          ...Object.values(state.tracks)
            .flat()
            .map((t) => t.trackId),
          ...state.excludedTracks,
        ]),
      );
      dispatch({ type: "ADD_TRACK", payload: { groupId, tracks: track } });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleExcludedTracksImport(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    if (!e.target.files || !(e.target.files.length > 0)) {
      throw new Error("No file(s)");
    }

    const files = Array.from(e.target.files);
    const isValidExtension = files.every((file) => {
      return file.name.split(".").pop()?.toLowerCase() === "m3u";
    });
    if (!isValidExtension) {
      throw new Error("Only M3U files are allowed.");
    }

    const stringifiedFiles = await Promise.all(files.map(readFileAsString));
    const excludedPaths = stringifiedFiles.map(m3uToFilePaths).flat();
    await getTrackIdsQuery.mutateAsync(excludedPaths, {
      onSuccess: (data) => {
        dispatch({
          type: "IMPORT_BLACKLISTED_TRACKS",
          payload: { trackIds: data },
        });
      },
    });
  }

  //

  function handleGroupOpenToggle(groupId: number) {
    dispatch({ type: "OPEN_GROUP", payload: { groupId } });
  }

  function handleGroupReorder(index: number, direction: Direction) {
    dispatch({ type: "REORDER_GROUP", payload: { index, direction } });
  }

  function handleTrackReorder({ index, direction, groupId }: TrackToReorder) {
    dispatch({ type: "REORDER_TRACK", payload: { index, direction, groupId } });
  }

  return {
    ...state,
    name: playlistName,
    handlePlaylistReset,
    handleGroupAdd,
    handleGroupRemove,
    handleGroupOpenToggle,
    handleGroupReorder,
    handleTrackAdd,
    handleTrackRemove,
    handleTrackReplace,
    handleTrackReorder,
    handleTracksReset,
    handleExcludedTracksImport,
  };
}
