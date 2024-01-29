import { GENRES } from "./config/constants";

export interface Track {
  trackId?: number;
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

export type FoundTrackDBResponse = {
  artist: string;
  duration: string;
  genre: string[];
  genre_id: number[];
  title: string;
  track_id: number;
  year: number;
};
export type FoundTrack = {
  artist: string;
  duration: number;
  genre: string[];
  genreId: number[];
  title: string;
  trackId: number;
  year: number;
};
