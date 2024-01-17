import { GENRES } from "./config/constants";

export interface Cover {
  readonly url: string;
  readonly destinationFilepath?: string;
  readonly data?: Buffer;
}

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

export type UserSettings = {
  isLibLoaded: boolean;
};

export type User = {
  appuser_id: number;
  name: string;
  settings: UserSettings;
};

export interface PaginatedDBResponse<Items> {
  total_count: number;
  items: Items[];
}

export interface PaginatedAPIResponse<Items> {
  totalCount: number;
  items: Items[];
}

export type FilterParams = {
  yearIds: number[] | null;
  artistIds: number[] | null;
  genreIds: number[] | null;
};

export type CreateSubplaylistDBResponse = {
  subplaylist_id: number;
  name: string;
};
