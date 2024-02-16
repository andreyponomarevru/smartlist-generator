import React from "react";
import { TrackMeta, FormValues, APIResponse, GetTrackRes } from "../types";
import { API_ROOT_URL } from "../config/env";
import { buildQuery } from "../utils/misc";
import { useEditableText } from "./use-editable-text";

type State = {
  name: string;
  groups: number[];
  groupNames: Record<string, string>;
  tracks: Record<string, TrackMeta[]>;
  blacklistedTracks: number[];
  isGroupOpen: Record<string, boolean>;
};
type Action =
  | { type: "ADD_GROUP_AFTER"; payload: { insertAt: number } }
  | { type: "DESTROY_GROUP"; payload: { groupId: number } }
  | { type: "RESET_GROUPS" }
  | { type: "RENAME_GROUP"; payload: { groupId: number; newName: string } }
  | {
      type: "REORDER_GROUP";
      payload: { index: number; direction: "UP" | "DOWN" };
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
      payload: { index: number; direction: "UP" | "DOWN"; groupId: number };
    }
  | { type: "IMPORT_BLACKLISTED_TRACKS"; payload: { trackIds: number[] } };

let counter = 0;

function playlistReducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_GROUP_AFTER": {
      const newGroupId = ++counter;
      return {
        ...state,
        groups: [
          ...state.groups.slice(0, action.payload.insertAt),
          newGroupId,
          ...state.groups.slice(action.payload.insertAt),
        ],
        groupNames: {
          ...state.groupNames,
          [`${newGroupId}`]: new Date().toLocaleTimeString(),
        },
        tracks: { ...state.tracks, [`${newGroupId}`]: [] },
        isGroupOpen: { ...state.isGroupOpen, [`${newGroupId}`]: true },
      };
    }
    case "ADD_TRACK": {
      return {
        ...state,
        tracks: {
          ...state.tracks,
          [`${action.payload.groupId}`]: [
            ...(state.tracks[`${action.payload.groupId}`] || []),
            ...(action.payload.tracks || []),
          ],
        },
      };
    }
    case "DESTROY_GROUP": {
      const {
        [`${action.payload.groupId}`]: _,
        ...updatedGroupNames
      } = state.groupNames;
      const {
        [`${action.payload.groupId}`]: __,
        ...updatedTracks
      } = state.tracks;

      return {
        ...state,
        groups: state.groups.filter((id) => id !== action.payload.groupId),
        groupNames: updatedGroupNames,
        tracks: { ...updatedTracks },
      };
    }
    case "RESET_GROUPS": {
      return {
        ...state,
        groups: [],
        groupNames: {},
        tracks: {},
        blacklistedTracks: state.blacklistedTracks,
        isGroupOpen: {},
      };
    }
    case "RENAME_GROUP": {
      return {
        ...state,
        groupNames: {
          ...state.groupNames,
          [`${action.payload.groupId}`]: action.payload.newName,
        },
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
      let removedIndex = state.tracks[`${action.payload.groupId}`].findIndex(
        (track) => track.trackId === action.payload.trackId
      );
      const filtered = state.tracks[`${action.payload.groupId}`].filter(
        (track) => track.trackId !== action.payload.trackId
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
        groupNames: {},
        tracks: {},
        blacklistedTracks: action.payload.trackIds,
        isGroupOpen: {},
      };
    }
    case "OPEN_GROUP": {
      return {
        ...state,
        isGroupOpen: {
          ...state.isGroupOpen,
          [`${action.payload.groupId}`]: !state.isGroupOpen[
            `${action.payload.groupId}`
          ],
        },
      };
    }
    case "REORDER_GROUP": {
      const oldIndex = action.payload.index;
      const newIndex = oldIndex + (action.payload.direction === "UP" ? -1 : 1);

      const movedItem = state.groups.find(
        (item, index) => index === oldIndex
      ) as number;
      const remainingItems = state.groups.filter(
        (item, index) => index !== oldIndex
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
        (item, index) => index === oldIndex
      ) as TrackMeta;
      const remainingItems = state.tracks[`${action.payload.groupId}`].filter(
        (item, index) => index !== oldIndex
      );

      console.log("oldIndex", oldIndex, "newIndex", newIndex);
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
    name: `Playlist ${new Date().toDateString()}`,
    groups: [],
    groupNames: {},
    tracks: {},
    blacklistedTracks: [],
    isGroupOpen: {},
  };

  const [state, dispatch] = React.useReducer(playlistReducer, initialState);

  const playlistName = useEditableText(state.name);

  function handleAddGroup(insertAt: number) {
    dispatch({ type: "ADD_GROUP_AFTER", payload: { insertAt } });
  }

  function handleDestroyGroup(groupId: number) {
    dispatch({ type: "DESTROY_GROUP", payload: { groupId } });
  }

  function handleResetGroups() {
    dispatch({ type: "RESET_GROUPS" });
  }

  function handleRenameGroup(
    groupId: number,
    newName: string = `${new Date().toLocaleTimeString()}`
  ) {
    dispatch({ type: "RENAME_GROUP", payload: { groupId, newName } });
  }

  //

  async function getTrack(formValues: FormValues) {
    const searchQuery = JSON.stringify({
      operator: formValues.operator.value,
      filters: buildQuery(formValues.filters),
      excludeTracks: [
        ...Object.values(state.tracks)
          .flat()
          .map((t) => t.trackId),
        ...state.blacklistedTracks,
      ],
    });

    return await fetch(`${API_ROOT_URL}/tracks`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json",
      },
      body: searchQuery,
    }).then((r) => r.json());
  }

  function handleRemoveTrack(groupId: number, trackId: number) {
    dispatch({ type: "REMOVE_TRACK", payload: { groupId, trackId } });
  }

  function handleResetTracks(groupId: number) {
    dispatch({ type: "RESET_TRACKS", payload: { groupId } });
  }

  async function handleReplaceTrack(
    groupId: number,
    trackId: number,
    formValues: FormValues
  ) {
    await getTrack(formValues)
      .then((r: GetTrackRes) => {
        dispatch({
          type: "REPLACE_TRACK",
          payload: { groupId, trackId, newTrack: r.results },
        });
      })
      .catch(console.error);
  }

  async function handleAddTrack(groupId: number, formValues: FormValues) {
    localStorage.setItem(`filter${groupId}`, JSON.stringify(formValues));

    await getTrack(formValues)
      .then((r: GetTrackRes) => {
        dispatch({
          type: "ADD_TRACK",
          payload: { groupId, tracks: r.results },
        });
      })
      .catch(console.error);
  }

  function handleImportBlacklistedTracks(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const fileReader = new FileReader();
    fileReader.readAsText((e.target as HTMLInputElement).files![0], "UTF-8");
    fileReader.onload = function (e) {
      if (e.target?.result && typeof e.target?.result === "string") {
        const filePaths = Object.values<{ [key: string]: TrackMeta }>(
          JSON.parse(e.target?.result)
        )
          .flat()
          .map((t) => t.filePath);

        // ... fetch request to API sending array of paths and getting an aray of trackIds ...

        /*dispatch({
        type: "IMPORT_BLACKLISTED_TRACKS",
        payload: { trackIds: e.target?.result ? [e.target?.result]  : [] } },
      });*/
      }
    };
  }

  //

  function toggleIsGroupOpen(groupId: number) {
    dispatch({ type: "OPEN_GROUP", payload: { groupId } });
  }

  function reorderGroup(index: number, direction: "UP" | "DOWN") {
    dispatch({ type: "REORDER_GROUP", payload: { index, direction } });
  }

  function reorderTrack(
    index: number,
    direction: "UP" | "DOWN",
    groupId: number
  ) {
    dispatch({ type: "REORDER_TRACK", payload: { index, direction, groupId } });
  }

  return {
    playlist: { ...state, name: playlistName },
    groups: {
      handleAdd: handleAddGroup,
      handleDestroy: handleDestroyGroup,
      handleRename: handleRenameGroup,
      handleReset: handleResetGroups,
      toggleIsGroupOpen,
      handleReorder: reorderGroup,
    },
    tracks: {
      handleAdd: handleAddTrack,
      handleRemove: handleRemoveTrack,
      handleReplace: handleReplaceTrack,
      handleReset: handleResetTracks,
      handleImportBlacklisted: handleImportBlacklistedTracks,
      handleReorder: reorderTrack,
    },
  };
}
