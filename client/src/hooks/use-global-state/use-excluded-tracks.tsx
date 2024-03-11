import React from "react";

import { m3uToFilePaths, readFileAsString } from "../../utils/misc";
import { useTrackIds } from "../api/use-track-ids";

type State = { trackIds: Set<number> };
type Action =
  | { type: "CLEAR" }
  | { type: "IMPORT"; payload: { trackIds: number[] } };

function tracksReducer(state: State, action: Action): State {
  switch (action.type) {
    case "CLEAR": {
      return { trackIds: new Set() };
    }
    case "IMPORT": {
      return {
        trackIds: new Set([...state.trackIds, ...action.payload.trackIds]),
      };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useExcludedTracks() {
  const initialState: State = { trackIds: new Set<number>() };

  function getInitialState(): State {
    const saved = localStorage.getItem("excludedTracks");

    if (saved !== null) {
      return { trackIds: new Set(JSON.parse(saved)) };
    } else {
      return initialState;
    }
  }

  const [state, dispatch] = React.useReducer(
    tracksReducer,
    initialState,
    getInitialState,
  );
  React.useEffect(() => {
    localStorage.setItem("excludedTracks", JSON.stringify([...state.trackIds]));
  }, [state.trackIds]);

  const getTrackIdsQuery = useTrackIds();

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
      throw new Error("Only M3U files are allowed.");
    }

    const stringifiedFiles = await Promise.all(files.map(readFileAsString));
    const excludedPaths = stringifiedFiles.map(m3uToFilePaths).flat();
    await getTrackIdsQuery.mutateAsync(excludedPaths, {
      onSuccess: (data) => {
        dispatch({ type: "IMPORT", payload: { trackIds: data } });
      },
    });
  }

  return {
    state,
    handleClear: clear,
    handleImport: importFromM3U,
  };
}
