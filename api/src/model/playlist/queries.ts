import format from "pg-format";
import { logDBError } from "../../utils/utilities";
import { connectDB } from "../../config/postgres";
import { GeneratedSubplaylist } from "../../types";

type Playlist = {
  playlist_id: number;
  name: string;
};

export async function create(title: string) {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text:
        "INSERT INTO playlist (name) VALUES ($1) RETURNING playlist_id, name;",
      values: [title],
    });
    return { id: response.rows[0].playlist_id, name: response.rows[0].name };
  } catch (err) {
    logDBError("Can't create a new playlist.", err);
    throw err;
  }
}

export async function read(id: number) {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text: "SELECT playlist_id, name FROM playlist WHERE playlist_id = $1;",
      values: [id],
    });

    // TODO ideally you should throw an error if ther db response is empty and return 404 to client
    return response.rows.length === 0
      ? null
      : { id: response.rows[0].playlist_id, name: response.rows[0].name };
  } catch (err) {
    logDBError("Can't read a playlist.", err);
    throw err;
  }
}

export async function readAll() {
  const pool = await connectDB();

  try {
    const response = await pool.query<Playlist>({
      text: "SELECT playlist_id, name FROM playlist;",
    });

    return response.rows.length === 0
      ? []
      : response.rows.map(({ playlist_id, name }) => {
          return { id: playlist_id, name };
        });
  } catch (err) {
    logDBError("Can't read all playlists.", err);
    throw err;
  }
}

export async function update({
  playlistId,
  name,
}: {
  playlistId: number;
  name: string;
}) {
  const pool = await connectDB();

  try {
    await pool.query({
      text: "UPDATE playlist SET name = $1 WHERE playlist_id = $2;",
      values: [name, playlistId],
    });
  } catch (err) {
    logDBError("Can't update playlist.", err);
    throw err;
  }
}

export async function destroy(id: number) {
  const pool = await connectDB();

  try {
    const response = await pool.query<{ playlist_id: number }>({
      text:
        "DELETE FROM playlist WHERE playlist_id = $1 RETURNING playlist_id;",
      values: [id],
    });

    return response.rows.length > 0 ? { playlistId: id } : null;
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}

//

export async function addTrack({
  trackId,
  playlistId,
  subplaylistId,
}: {
  trackId: number;
  playlistId: number;
  subplaylistId: number;
}) {
  const pool = await connectDB();

  try {
    await pool.query({
      text:
        "INSERT INTO \
           track_playlist (track_id, playlist_id, subplaylist_id) \
         VALUES \
           ($1, $2, $3);",
      values: [trackId, playlistId, subplaylistId],
    });
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}

export async function removeTrack({
  playlistId,
  trackId,
}: {
  playlistId: number;
  trackId: number;
}) {
  const pool = await connectDB();

  try {
    await pool.query<{ track_id: number }>({
      text:
        "DELETE FROM \
           track_playlist \
         WHERE \
           playlist_id = $1 AND track_id = $2 \
         RETURNING \
           track_id;",
      values: [playlistId, trackId],
    });
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}

export async function updateTracksInPlaylist(
  playlistId: number,
  newTracks: { trackId: number; subplaylistId: number }[],
) {
  const pool = await connectDB();

  try {
    // TODO refactor in a single query
    await pool.query({
      text: "DELETE FROM track_playlist WHERE playlist_id = $1;",
      values: [playlistId],
    });

    await pool.query({
      text: format(
        "INSERT INTO track_playlist (track_id, playlist_id, subplaylist_id) \
           VALUES %L;",
        newTracks.map((track) => {
          return [track.trackId, playlistId, track.subplaylistId];
        }),
      ),
    });
  } catch (err) {
    logDBError("Can't update tracks in playlist.", err);
    throw err;
  }
}

export async function getTracks(
  playlistId: number,
): Promise<GeneratedSubplaylist[]> {
  const pool = await connectDB();

  try {
    const response = await pool.query<{
      track_id: number;
      title: string;
      duration: string;
      file_path: string;
      year: number;
      artist: string[];
      genre: string[];
      subplaylist_id: number;
    }>({
      text:
        "SELECT \
           viewtr.* \
         FROM \
           view_track AS viewtr \
         INNER JOIN track_playlist AS tr_pl ON viewtr.track_id = tr_pl.track_id WHERE \
           tr_pl.playlist_id = $1 AND \
           tr_pl.subplaylist_id = viewtr.subplaylist_id;",
      values: [playlistId],
    });

    return response.rows.length === 0
      ? []
      : response.rows.map((row) => {
          return {
            track_id: row.track_id,
            trackId: row.track_id,
            title: row.title,
            duration: parseFloat(row.duration),
            filePath: row.file_path,
            year: row.year,
            artist: row.artist,
            genre: row.genre,
            subplaylistId: row.subplaylist_id,
          };
        });
  } catch (err) {
    logDBError("Can't delete playlist.", err);
    throw err;
  }
}
