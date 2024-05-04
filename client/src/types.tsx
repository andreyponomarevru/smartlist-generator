export type TrackMeta = {
  artists: string[];
  duration: number;
  genres: string[];
  genreIds: number[];
  title: string;
  trackId: number;
  year: number;
  filePath: string;
};

//
// Forms
//

export type OptionsList<Value = number> = { label: string; value: Value };
export type Filter = {
  name: OptionsList<string>;
  condition: OptionsList<string> | null;
  value: OptionsList<number> | OptionsList<number>[] | null;
};
export interface FilterFormValues {
  name: string;
  operator: OptionsList<string>;
  filters: Filter[];
}
export interface SavedFilterFormValues {
  filterId: OptionsList<string>;
}
export type LibPathInput = { libPath: string };

//
// API
//

export type APIResponseSuccess<T> = { results: T };
export type APIResponseError = {
  status: number;
  message: string;
  moreInfo: string;
};
export type Stats = {
  years: { name: string; count: number }[];
  genres: { id?: number; name: string; count: number }[];
};
export type FilterQuery = {
  name: string;
  condition: string;
  value: number | number[];
};
export type SearchQuery = {
  operator: string;
  filters: FilterQuery[];
  excludeTracks: number[];
};

// SSE

type ValidationStats = { names: (string | number)[]; count: number };
export type TrackValidatorError = {
  filePath: string;
  id3TagName: string | number;
  id3TagValue?: string | string[] | number;
  err: string;
};
export type ValidationResult = {
  errors: TrackValidatorError[];
  artists: ValidationStats;
  years: ValidationStats;
  genres: ValidationStats;
} | null;
export type OSProcessStatus = "pending" | "success" | "failure" | null;
export type OSProcessName = "validation" | "seeding";
export type SSEMessage = {
  name: OSProcessName;
  createdAt?: number;
  updatedAt?: number;
  status: OSProcessStatus;
  result: ValidationResult;
};
export type ValidationQuery = { libPath: string };
