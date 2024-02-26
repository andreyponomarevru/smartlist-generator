import { Control, UseFormResetField } from "react-hook-form";

export type TrackMeta = {
  year: number;
  artist: string[];
  title: string;
  duration: number;
  genre: string[];
  genreId: number[];
  trackId: number;
  filePath: string;
};

//
// Forms
//

export type OptionsList<Value> = {
  label: string;
  value: Value;
};

export interface FilterFormValues {
  operator: { label: string; value: string };
  filters: {
    name: { label: string; value: string };
    condition?: { label: string; value: string };
    value?: OptionsList<number> | OptionsList<number>[];
  }[];
}

export interface SavedFilterFormValues {
  savedFilterId: OptionsList<string>;
}

//
// API
//

export type APIError = { status: number; moreInfo: string; message: string };

export type Stats = { id?: number; name: string; count: number };

export type GetStatsRes = { results: Stats[] };

export type GetTrackRes = { results: TrackMeta[] };

export type FindTrackIdsRes = { results: number[] };

export type SelectProps<OptionsValue> = {
  name?: string;
  control: Control<FilterFormValues>;
  index: number;
  resetField: UseFormResetField<FilterFormValues>;
  options: OptionsList<OptionsValue>[];
  defaultValue?: OptionsList<OptionsValue>;
};

export type SearchQuery = {
  operator: string;
  filters: {
    value: number | (number | undefined)[] | undefined;
    name: string;
    condition?: string;
  }[];
  excludeTracks: number[];
};
