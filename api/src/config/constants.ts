import genresJSON from "./genres.json";

export type Genre = { id: number; name: string };
export const GENRES: ReadonlyArray<Genre> = genresJSON;

export const API_PREFIX = "/api";

//

export const FILTER_OPERATOR = ["and", "or"] as const;
export const FILTER_CONDITIONS = [
  "is",
  "is not",
  "greater than or equal",
  "less than or equal",
  "contains any",
  "contains all",
  "does not contain all",
  "does not contain any",
] as const;
