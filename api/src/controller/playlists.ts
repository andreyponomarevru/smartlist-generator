import express, { Request, Response, NextFunction } from "express";
import util from "util";
import * as playlistsModel from "../model/playlist/queries";
import { validate } from "../middlewares/validate";
import { createPlaylistSchema } from "../config/validation-schemas";

const router = express.Router();

type Playlist = { id: number; name: string };

export async function createPlaylist(
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    { name: string }
  >,
  res: Response<{ results: Playlist }>,
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
  res: Response<{ results: Playlist[] }>,
  next: NextFunction,
) {
  try {
    res.json({ results: await playlistsModel.readAll() });
  } catch (err) {
    next(err);
  }
}

export async function getPlaylist(
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    { id: number }
  >,
  res: Response<{ results: Playlist | null }>,
  next: NextFunction,
) {
  try {
    res.json({ results: await playlistsModel.read(req.params.id as number) });
  } catch (err) {
    next(err);
  }
}

export async function destroyPlaylist(
  req: Request<
    Record<string, unknown>,
    Record<string, unknown>,
    { id: number }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    await playlistsModel.destroy(req.params.id as number);
    res.status(204).end();
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
router.get("/api/playlists/:id", getPlaylist);
router.delete("/api/playlists/:id", destroyPlaylist);

export { router };
