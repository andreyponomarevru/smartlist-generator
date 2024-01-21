import express, { Request, Response, NextFunction } from "express";
import util from "util";
import * as playlistsModel from "../model/playlist/queries";
import { validate } from "../middlewares/validate";
import { createPlaylistSchema } from "../config/validation-schemas";

const router = express.Router();

type Playlist = { id: number; name: string };
type CreatePlaylistRequest = Request<
  Record<string, unknown>,
  Record<string, unknown>,
  { name: string }
>;
type CreatePlaylistResponse = Response<{ results: Playlist }>;
type GetPlaylistResponse = Response<{ results: Playlist[] }>;

export async function createPlaylist(
  req: CreatePlaylistRequest,
  res: CreatePlaylistResponse,
  next: NextFunction,
) {
  try {
    res.status(201).json({
      results: await playlistsModel.create(req.body.name),
    });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylists(
  req: Request,
  res: GetPlaylistResponse,
  next: NextFunction,
) {
  try {
    res.json({ results: await playlistsModel.readAll() });
  } catch (err) {
    next(err);
  }
}

router.post(
  "/api/playlists",
  validate(createPlaylistSchema, "body"),
  createPlaylist,
);
router.get("/api/playlists", getPlaylists);

export { router };
