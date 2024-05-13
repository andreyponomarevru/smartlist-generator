import express from "express";

export interface Track {
  trackId?: number;
  duration: number;
  artists: string[];
  year: number;
  title: string;
  genres: string[];
}
export interface FoundTrack extends Track {
  genreIds: number[];
  trackId: number;
  filePath: string;
}
export interface ParsedTrack extends Track {
  filePath: string;
  hasCover: boolean;
}
export type DBResponseFoundTrack = {
  artists: string[];
  duration: string;
  genres: string[];
  genre_ids: number[];
  title: string;
  track_id: number;
  year: number;
  file_path: string;
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
type ValidationStats = { names: (string | number)[]; count: number };
export type ValidationResult = {
  errors: TrackValidatorError[];
  artists: ValidationStats;
  years: ValidationStats;
  genres: ValidationStats;
} | null;
export type OSProcessStatus = "pending" | "success" | "failure" | null;
export type OSProcessName = "validation" | "seeding";
export type ProcessDBResponse = {
  name: OSProcessName;
  created_at: number;
  updated_at: number;
  status: OSProcessStatus;
  result: ValidationResult;
};
export type SSEMessage = {
  name: OSProcessName;
  createdAt: number;
  updatedAt: number;
  status: OSProcessStatus;
  result: ValidationResult;
};
export type OSProcessMessage = {
  name: OSProcessName;
  status: OSProcessStatus;
  result?: ValidationResult;
};
export type SSEname = OSProcessName | "test";
export type AppLoader = {
  app: express.Express;
  express: typeof import("express");
};
export type Stats = {
  years: { name: string; count: number }[];
  genres: { id: number; name: string; count: number }[];
};
