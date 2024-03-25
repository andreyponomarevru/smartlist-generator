import { GENRES } from "./config/constants";

export interface Track {
  trackId?: number;
  duration: number;
  artists: string[];
  year: number;
  title: string;
  genres: string[];
}
export interface ValidatedTrack {
  trackId?: number;
  filePath: string;
  duration: number;
  artists: string[];
  year: number;
  title: string;
  genres: (typeof GENRES)[number][];
}
export type FoundTrackDBResponse = {
  artists: string[];
  duration: string;
  genres: string[];
  genre_ids: number[];
  title: string;
  track_id: number;
  year: number;
  file_path: string;
};
export type FoundTrack = {
  artists: string[];
  duration: number;
  genres: string[];
  genreIds: number[];
  title: string;
  trackId: number;
  year: number;
  filePath: string;
};
export type Filter = {
  name: string;
  condition: string;
  value: number | number[];
};
export type TrackValidatorError = {
  filePath: string;
  tag: string | number;
  value?: string | string[] | number;
  msg: string;
};
export type TaskStatus = "pending" | "success" | "failure" | null;
type ValidationStats = {
  names: (string | number)[];
  count: number;
};
type ValidationResult = {
  errors: TrackValidatorError[];
  artists: ValidationStats;
  years: ValidationStats;
  genres: ValidationStats;
};
export type TaskResult = ValidationResult | null;
export type TaskName = "validation" | "seeding";
export type TaskDBResponse = {
  name: TaskName;
  created_at: number;
  updated_at: number;
  status: TaskStatus;
  result: TaskResult;
};
export type Task = {
  name: TaskName;
  createdAt: number;
  updatedAt: number;
  status: TaskStatus;
  result: TaskResult;
};
export type ProcessMessage = {
  name: TaskName;
  status: TaskStatus;
  result?: TaskResult;
};
