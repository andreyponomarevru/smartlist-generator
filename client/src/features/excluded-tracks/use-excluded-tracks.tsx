import React from "react";

import { m3uToFilePaths, readFileAsString } from "../../utils";
import { useTrackIdsFromPaths } from "./api/use-track-ids-from-paths";
import { useLocalStorage } from "../../hooks/use-local-storage";

type ImportedTrack = { trackId: number; filePath: string };

type State = { tracks: Set<ImportedTrack>; errors: Error[] };
type Action =
  | { type: "CLEAR" }
  | { type: "IMPORT"; payload: { tracks: ImportedTrack[] } }
  | { type: "ADD_ERROR"; payload: { error: Error } };

function tracksReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CLEAR": {
      return { ...state, tracks: new Set(), errors: [] };
    }
    case "IMPORT": {
      return {
        ...state,
        tracks: new Set([...state.tracks, ...action.payload.tracks]),
        errors: [],
      };
    }
    case "ADD_ERROR": {
      return {
        ...state,
        errors: [action.payload.error],
      };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useExcludedTracks() {
  const initialState: State = { tracks: new Set<ImportedTrack>(), errors: [] };

  const [saved, setSaved] = useLocalStorage<ImportedTrack[]>("excludedTracks", [
    ...initialState.tracks,
  ]);

  function getInitialState() {
    return { tracks: new Set(saved), errors: initialState.errors };
  }

  const [state, dispatch] = React.useReducer(
    tracksReducer,
    initialState,
    getInitialState,
  );
  React.useEffect(() => {
    setSaved([...state.tracks]);
  }, [state.tracks, setSaved]);

  const getTracksQuery = useTrackIdsFromPaths();

  function clear() {
    dispatch({ type: "CLEAR" });
  }

  async function importFromM3U(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || !(e.target.files.length > 0)) {
      throw new Error("No file(s)");
    }

    const files = Array.from(e.target.files);
    const isValidExtension = files.every((file) => {
      return file.name.split(".").pop()?.toLowerCase() === "m3u";
    });
    if (!isValidExtension) {
      dispatch({
        type: "ADD_ERROR",
        payload: { error: new Error("Only M3U files are allowed") },
      });
      return;
    }

    const stringifiedFiles = await Promise.all(files.map(readFileAsString));
    const excludedPaths = stringifiedFiles.map(m3uToFilePaths).flat();

    try {
      const track = await getTracksQuery.mutateAsync(excludedPaths);
      dispatch({ type: "IMPORT", payload: { tracks: track } });
    } catch (err) {
      // Already handled (displayed via getTrackQuery.errors)
    }
  }

  return {
    state,
    handleClear: clear,
    handleImport: importFromM3U,
    getTracksQuery,
  } as const;
}
