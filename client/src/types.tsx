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
  options?: OptionsList<OptionsValue>[];
  conditionOptions?: OptionsList<OptionsValue>[];
  valueOptions?: Record<string, OptionsList<OptionsValue>[]>;

  defaultValue?: OptionsList<OptionsValue> | null;
  closeMenuOnSelect?: boolean;
  resetField?: UseFormResetField<FilterFormValues>;
  isMulti?: boolean;
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
