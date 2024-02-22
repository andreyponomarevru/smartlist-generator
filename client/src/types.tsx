import {
  UseFormRegister,
  Control,
  UseFormResetField,
  UseFormUnregister,
  UseFormSetValue,
} from "react-hook-form";

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

export interface FormValues {
  operator: { label: string; value: string };
  filters: {
    name: { label: string; value: string };
    condition?: { label: string; value: string };
    value?: OptionsList<number> | OptionsList<number>[];
  }[];
}

//
// API
//

export type ParsedResponse<Body> = {
  status: number;
  body: Body | null;
};

export interface APIResponse<Results> {
  error: APIError | Error | null;
  isLoading: boolean;
  response: ParsedResponse<Results> | null;
}

export type APIError = { status: number; moreInfo: string; message: string };

export type Stats = { id?: number; name: string; count: number };

export type GetStatsRes = { results: Stats[] };

export type GetTrackRes = { results: TrackMeta[] };

export type FindTrackIdsRes = { results: number[] };

export type SelectProps<OptionsValue> = {
  name?: string;
  control: Control<FormValues>;
  index: number;
  resetField: UseFormResetField<FormValues>;
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
