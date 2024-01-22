import express, { Request, Response, NextFunction } from "express";
import * as playlistsModel from "../model/playlist/queries";
import { validate } from "../middlewares/validate";
import {
  schemaCreatePlaylist,
  schemaUpdatePlaylist,
  schemaId,
} from "../config/validation-schemas";

const router = express.Router();

type Playlist = { id: number; name: string };

export async function createPlaylist(
  req: Request<
    Record<string, string>,
    Record<string, string>,
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
  req: Request<{ id: number }>,
  res: Response<{ results: Playlist | null }>,
  next: NextFunction,
) {
  try {
    res.json({ results: await playlistsModel.read(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updatePlaylist(
  req: Request<{ id: number }, Record<string, string>, { name: string }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await playlistsModel.update({
      playlistId: req.params.id,
      name: req.body.name,
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function destroyPlaylist(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await playlistsModel.destroy(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

router.post(
  "/api/playlists",
  validate(schemaCreatePlaylist, "body"),
  createPlaylist,
);

router.get("/api/playlists", getPlaylists);

router.get("/api/playlists/:id", getPlaylist);

router.patch(
  "/api/playlists/:id",
  validate(schemaId, "params"),
  validate(schemaUpdatePlaylist, "body"),
  updatePlaylist as any,
);
router.delete("/api/playlists/:id", destroyPlaylist);

export { router };
