import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  FilterFormValues,
  SearchQuery,
  APIResponseError,
  FilterQuery,
  Filter,
} from "../types";

// Type Assertions

export function isAPIErrorType(err: unknown): err is APIResponseError {
  return (
    typeof err === "object" && err !== null && "name" in err && "message" in err
  );
}

function isFetchBaseQueryError(err: unknown): err is FetchBaseQueryError {
  return typeof err === "object" && err !== null && "status" in err;
}

function isErrorWithMessage(err: unknown): err is { message: string } {
  return (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof err.message === "string"
  );
}

//

export function getRTKQueryErr(err: unknown) {
  if (isFetchBaseQueryError(err)) {
    const errMsg = "error" in err ? err.error : JSON.stringify(err.data);
    return errMsg;
  } else if (isErrorWithMessage(err)) {
    return err.message;
  } else {
    console.log("Unknown type of error", err);
    return "Unknown type of error";
  }
}

export function extractFilename(path: string): string {
  if (!path.includes("/")) return path;

  const pathArray = path.split("/");
  const lastIndex = pathArray.length - 1;

  return pathArray[lastIndex];
}

export function toHourMinSec(sec: number): string {
  if (sec < 0) {
    throw new Error(`${sec} should be >= 0`);
  } else if (!Number.isFinite(sec)) {
    throw new Error(`${sec} should be a finite number`);
  }

  const hms = new Date(sec * 1000).toISOString().substring(11, 19).split(":");
  if (hms[0] !== "00") return hms.join(":");
  else return hms.slice(1).join(":");
}

export function buildFilterQuery(filter: Filter): FilterQuery {
  const validFilterNames = ["genre", "year"];

  if (!validFilterNames.includes(filter.name.value)) {
    throw new Error("Invalid filter name");
  }

  if (filter.condition === null) {
    throw new Error("'condition' can't be null");
  }

  if (filter.value === null) {
    throw new Error("'value' can't be null");
  }
  if (filter.name.value === "year" && Array.isArray(filter.value)) {
    throw new Error("Year 'value' can't be an array");
  }

  return {
    name: filter.name.value,
    condition: filter.condition.value,
    value: Array.isArray(filter["value"])
      ? filter.value.map((v) => v.value)
      : filter["value"].value,
  };
}

export function buildFindTrackReqBody(
  form: FilterFormValues,
  excludedTracks: number[],
  buildFilterQuery: (filter: Filter) => FilterQuery,
): SearchQuery {
  return {
    operator: form.operator.value,
    excludeTracks: excludedTracks,
    filters: form.filters.map((f) => buildFilterQuery(f)),
  };
}

export function exportData<T>(data: T, fileName = "exported-data"): void {
  const link = document.createElement("a");
  link.href = `data:text/json;chatset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2),
  )}`;
  link.download = `${fileName}.json`;
  link.click();
}

export function encodeRFC3986URIComponent(str: string): string {
  return encodeURI(str).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function parseFileToStrings(file: File): Promise<string> {
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
