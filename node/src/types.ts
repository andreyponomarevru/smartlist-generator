export interface Cover {
  readonly url: string;
  readonly destinationFilepath?: string;
  readonly data?: Buffer;
}

export type Title = string;
export type Year = number;
export type ReleaseId = number;
export type CoverPath = string;
export type Artist = string[];
export type Duration = number;
export type Genre = string[];
export type FilePath = string;
export type TrackId = number;

export interface ParsedTrack {
  filePath: string;
  duration: number;
  artist: string[];
  year: number;
  title: string;
  genre: string[];
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
  labelIds: number[] | null;
  genreIds: number[] | null;
};
