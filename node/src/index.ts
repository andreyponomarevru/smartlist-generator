import express from "express";
import util from "util";
import * as mm from "music-metadata";

// Spin up server

const app = express();
app.use(express.json());

// Process tracks

async function parseTrack(trackPath: string) {
  const metadata = await mm.parseFile(trackPath);
  console.log(
    util.inspect(metadata.format.duration, { showHidden: true, depth: null }),
  );

  const genre = metadata?.common?.genre?.[0];
  const artist = metadata.common.artist;
  const year = metadata.common.year;

  if (!genre || !artist || !year) {
    throw new Error(`Some id3v2 tag is empty: ${trackPath}`);
  }

  return { filepath: trackPath, genre, artist, year };
}
