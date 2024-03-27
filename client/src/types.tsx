import { Control, UseFormResetField } from "react-hook-form";

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

export type OptionsList<Value> = { label: string; value: Value };
export interface FilterFormValues {
  name: string;
  operator: { label: string; value: string };
  filters: {
    name: { label: string; value: string };
    condition: { label: string; value: string } | null;
    value: OptionsList<number> | OptionsList<number>[] | null;
  }[];
}
export interface SavedFilterFormValues {
  filterId: OptionsList<string>;
}
export type LibPathInput = { libPath: string };

//
// API
//

export type APIError = { status: number; moreInfo: string; message: string };
export type Stats = { id?: number; name: string; count: number };
export type GetStatsRes = { results: Stats[] };
export type GetTrackRes = { results: TrackMeta[] };
export type GetTrackIdsByFilePaths = {
  results: { trackId: number; filePath: string }[];
};
export type FindTrackIdsRes = { results: number[] };
export type SelectProps<OptionsValue> = {
  name: string;
  control: Control<FilterFormValues>;
  index: number;
  optionsForCondition: OptionsList<OptionsValue>[];
  optionsForValue: Record<string, OptionsList<OptionsValue>[]>;
  resetField?: UseFormResetField<FilterFormValues>;
  isDirty?: boolean;
};
export type SearchQuery = {
  operator: string;
  filters: {
    name: string;
    condition?: string;
    value: number | (number | undefined)[] | undefined;
  }[];
  excludeTracks: number[];
};

// SSE

type ValidationStats = {
  names: (string | number)[];
  count: number;
};
export type TrackValidatorError = {
  filePath: string;
  tag: string | number;
  value?: string | string[] | number;
  msg: string;
};
export type ValidationResult = {
  errors: TrackValidatorError[];
  artists: ValidationStats;
  years: ValidationStats;
  genres: ValidationStats;
};
export type ProcessStatus = "pending" | "success" | "failure" | null;
export type ProcessResult = ValidationResult | null;
export type ProcessName = "validation" | "seeding";
export type Process = {
  name: ProcessName;
  createdAt?: number;
  updatedAt?: number;
  status: ProcessStatus;
  result: ProcessResult;
};
export type ValidationQuery = { libPath: string };
