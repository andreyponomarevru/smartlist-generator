import { GENRES } from "./config/constants";

export type TrackMeta = {
  year: number;
  artist: string[];
  title: string;
  length: string;
};

export type NewPlaylist = {
  id: number;
  name: string;
};

//
// Forms
//

export type SignInForm = { emailOrUsername: string; password: string };
export type RegisterForm = {
  email: string;
  username: string;
  password: string;
};
export type Credentials = {
  password: string;
  username?: string;
  email?: string;
};

//
// API
//

export type ParsedResponse<T> = {
  status: number;
  body: T | null;
};

export interface APIResponse<Results> {
  error: APIError | Error | null;
  isLoading: boolean;
  response: ParsedResponse<Results> | null;
}

export type APIError = { status: number; moreInfo: string; message: string };
export type GetAllPlaylistsResponse = {
  results: { id: number; name: string }[];
};
export type GetStatsResponse = {
  results: { id: number; name: string; count: number }[];
};
