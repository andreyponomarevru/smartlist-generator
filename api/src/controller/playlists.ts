import express, { Request, Response, NextFunction } from "express";
import * as playlistsModel from "../model/playlist/queries";
import { validate } from "../middlewares/validate";
import {
  schemaCreatePlaylist,
  schemaUpdatePlaylist,
  schemaIdParam,
  schemaUpdateTracksInPlaylist,
} from "../config/validation-schemas";
import { FoundTrack } from "../types";

const router = express.Router();

type Playlist = { id: number; name: string };

export async function createPlaylist(
  req: Request<any, any, { name: string }>,
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
  req: Request<{ id: number }, any, any>,
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
  req: Request<{ id: number }, any, { name: string }>,
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

//

export async function removeTracksFromPlaylist(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    await playlistsModel.removeAllTracks(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function getTracksFromPlaylist(
  req: Request<{ id: number }>,
  res: Response,
  next: NextFunction,
) {
  try {
    res.json({ results: await playlistsModel.readTracks(req.params.id) });
  } catch (err) {
    next(err);
  }
}

export async function updateTracksInPlaylist(
  req: Request<
    { id: number },
    any,
    { tracks: { trackId: number; position: number }[] }
  >,
  res: Response,
  next: NextFunction,
) {
  try {
    await playlistsModel.updateTracks(req.params.id, req.body.tracks);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

//

router.post(
  "/api/playlists",
  validate(schemaCreatePlaylist, "body"),
  createPlaylist,
);

router.get("/api/playlists", getPlaylists);

router.get(
  "/api/playlists/:id",
  validate(schemaIdParam, "params"),
  getPlaylist as any,
);

router.patch(
  "/api/playlists/:id",
  validate(schemaIdParam, "params"),
  validate(schemaUpdatePlaylist, "body"),
  updatePlaylist as any,
);
router.delete(
  "/api/playlists/:id",
  validate(schemaIdParam, "params"),
  destroyPlaylist as any,
);

//

router.get(
  "/api/playlists/:id/tracks",
  validate(schemaIdParam, "params"),
  getTracksFromPlaylist as any,
);

router.put(
  "/api/playlists/:id/tracks",
  validate(schemaIdParam, "params"),
  validate(schemaUpdateTracksInPlaylist, "body"),
  updateTracksInPlaylist as any,
);

/* I don't need this route
router.delete(
  "/api/playlists/:id/tracks",
  validate(schemaIdParam, "params"),
  validate(schemaRemoveTracksFromPlaylist, "query"),
  removeTracksFromPlaylist as any,
);*/

export { router };
