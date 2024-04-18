import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  FilterFormValues,
  TrackMeta,
  SearchQuery,
  ProcessResult,
  APIResponseError,
} from "../types";

export function isAPIErrorType(err: unknown): err is APIResponseError {
  return (
    typeof err === "object" && err !== null && "name" in err && "message" in err
  );
}

export function isErrorWithMessage(
  error: unknown,
): error is { message: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as any).message === "string"
  );
}

export function isFetchBaseQueryError(
  error: unknown,
): error is FetchBaseQueryError {
  return typeof error === "object" && error !== null && "status" in error;
}

export function extractFilename(path: string) {
  const pathArray = path.split("/");
  const lastIndex = pathArray.length - 1;
  return pathArray[lastIndex];
}

export function toHourMinSec(sec: number) {
  const hms = new Date(sec * 1000).toISOString().substring(11, 19).split(":");
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

export function exportValidationReport(report: ProcessResult) {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(report, null, 2),
  )}`;
  link.download = "validation-report.json";
  link.click();
}

export function encodeRFC3986URIComponent(str: string) {
  return encodeURI(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function parseFileToStrings(file: File): Promise<string[] | string> {
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
