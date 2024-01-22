import { GENRES } from "./config/constants";

export interface Track {
  trackId?: number;
  filePath: string;
  duration: number;
  artist: string[];
  year: number;
  title: string;
  genre: string[];
}

export interface ValidatedTrack {
  trackId?: number;
  filePath: string;
  duration: number;
  artist: string[];
  year: number;
  title: string;
  genre: typeof GENRES[number][];
}

export type CreateSubplaylistDBResponse = {
  subplaylist_id: number;
  name: string;
};

export type GeneratedSubplaylist = {
  trackId: number;
  title: string;
  duration: number;
  filePath: string;
  year: number;
  artist: string[];
  genre: string[];
  subplaylistId: number;
};

export type GenerateSubplaylistRequest = {
  subplaylistId: number;
  limit: number;
  excludeTrackId?: number[];
};
