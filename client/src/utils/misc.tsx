import { FilterFormValues, TrackMeta, SearchQuery } from "../types";
import { MUSIC_LIB_DIR } from "../config/env";
import { LOCAL_MUSIC_LIB_DIR } from "../config/env";
import { State as SavedFiltersState } from "../hooks/use-saved-filters";

export function extractFilename(path: string) {
  const pathArray = path.split("/");
  const lastIndex = pathArray.length - 1;
  return pathArray[lastIndex];
}

export function toHourMinSec(sec: number) {
  const hms = new Date(sec * 1000).toISOString().substr(11, 8).split(":");
  if (hms[0] !== "00") return hms.join(":");
  else return hms.slice(1).join(":");
}

export function buildSearchQuery(
  formValues: FilterFormValues,
  excludedTracks: number[],
) {
  function buildFilters(filters: FilterFormValues["filters"]) {
    // When there is only a single value selected in React-select multiselect dropdown, it is submitted as { label: string, value: object} , instead of as object inside an array ([ { label: string, value: object } ]).
    // Here we wrap it in array, to keep it consistent.
    const withFixedValueKey = filters.map((filter) => {
      return {
        name: filter.name.value,
        condition: filter.condition?.value,
        value:
          !Array.isArray(filter["value"]) && filter["name"].value === "genre"
            ? [filter["value"]]
            : !Array.isArray(filter["value"])
              ? filter["value"]?.value
              : filter["value"],
      };
    });

    return withFixedValueKey.map((filter) => ({
      ...filter,
      // Strip irrelevant keys
      //name: filter.name,
      //condition: filter.condition,
      // Merge all genre ids into a single array
      value: Array.isArray(filter.value)
        ? filter.value.map((v) => v?.value)
        : filter.value,
    }));
  }

  const searchQuery: SearchQuery = {
    operator: formValues.operator.value,
    filters: buildFilters(formValues.filters),
    excludeTracks: excludedTracks,
  };

  return searchQuery;
}

export function exportPlaylistAsJSON(
  playlistName: string,
  tracks: Record<string, TrackMeta[]>,
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(
      Object.values(tracks)
        .flat()
        .map((t) => t.filePath),
      null,
      2,
    ),
  )}`;
  link.download = `${playlistName}.json`;
  link.click();
}

export function exportPlaylistToM3U(
  playlistName: string,
  tracks: Record<string, TrackMeta[]>,
  groupIds: number[],
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#PLAYLIST:${playlistName}\n\n${groupIds
      .map((groupId) => tracks[`${groupId}`])
      .flat()
      .map((t) => `file://${encodeRFC3986URIComponent(t.filePath)}`)
      .join("\n")}`,
  )}`;
  link.download = `${playlistName}.m3u`;
  link.click();
}

export function exportSavedFiltersToJSON(
  playlistName: string,
  filters: SavedFiltersState,
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(filters, null, 2),
  )}`;
  link.download = `${playlistName}.json`;
  link.click();
}

export function encodeRFC3986URIComponent(str: string) {
  return encodeURI(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function m3uToFilePaths(m3u: string) {
  const m3uStrings = m3u.split("\n");
  const filePaths: string[] = [];

  for (let i = 3; i < m3uStrings.length; i++) {
    const filePath =
      MUSIC_LIB_DIR +
      decodeURIComponent(m3uStrings[i])
        .replace("file://", "")
        .replace(LOCAL_MUSIC_LIB_DIR, "");
    filePaths.push(filePath);
  }

  return filePaths;
}

export function readFileAsString(file: File): Promise<string> {
  return new Promise(function (resolve, reject) {
    const fr = new FileReader();

    fr.onload = (e) => {
      const fileContent = e.target?.result;
      if (typeof fileContent === "string") resolve(fileContent);
      else reject("File content is not a text");
    };
    fr.onerror = () => reject(fr);
    fr.readAsText(file, "UTF-8");
  });
}
