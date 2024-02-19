import { FormValues, TrackMeta } from "../types";

export function toHourMinSec(sec: number) {
  let hms = new Date(sec * 1000).toISOString().substr(11, 8).split(":");
  if (hms[0] !== "00") return hms.join(":");
  else return hms.slice(1).join(":");
}

export function buildQuery(filters: FormValues["filters"]) {
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

export function exportPlaylistAsJSON(
  playlistName: string,
  tracks: Record<string, TrackMeta[]>
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(
      Object.values(tracks)
        .flat()
        .map((t) => t.filePath),
      null,
      2
    )
  )}`;
  link.download = `${playlistName}.json`;
  link.click();
}

export function exportPlaylistAsM3U(
  playlistName: string,
  tracks: Record<string, TrackMeta[]>,
  groupIds: number[]
) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    `#EXTM3U\n#PLAYLIST:${playlistName}\n\n${groupIds
      .map((groupId) => tracks[`${groupId}`])
      .flat()
      .map((t) => `file://${encodeRFC3986URIComponent(t.filePath)}`)
      .join("\n")}`
  )}`;
  link.download = `${playlistName}.m3u`;
  link.click();
}

export function exportFiltersTemplate() {
  //("/mnt/CE64EB6A64EB53AD/music-lib/inbox-listened/chillout_psy_tagged/Lexx - Cosmic Shift (2019) [WEB FLAC]/Lexx - Cosmic Shift - 06 Hot Weather Feat. Harriett Brown.flac");
}

export function encodeRFC3986URIComponent(str: string) {
  return encodeURI(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`
  );
}
