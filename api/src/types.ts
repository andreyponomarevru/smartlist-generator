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
  genres: string[];
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
  id3TagName: string | number;
  id3TagValue?: string | string[] | number;
  err: string;
};
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
export type ProcessStatus = "pending" | "success" | "failure" | null;
export type ProcessResult = ValidationResult | null;
export type ProcessName = "validation" | "seeding";
export type ProcessDBResponse = {
  name: ProcessName;
  created_at: number;
  updated_at: number;
  status: ProcessStatus;
  result: ProcessResult;
};
export type Process = {
  name: ProcessName;
  createdAt: number;
  updatedAt: number;
  status: ProcessStatus;
  result: ProcessResult;
};
export type ProcessMessage = {
  name: ProcessName;
  status: ProcessStatus;
  result?: ProcessResult;
};
export type SSEname = ProcessName | "test";
