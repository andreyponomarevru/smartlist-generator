import * as mm from "music-metadata";
import { parseID3V2Array } from "../../utils";
import { ParsedTrack } from "../../types";

export async function parseAudioFile(filePath: string): Promise<ParsedTrack> {
  const trackMetadata = await mm.parseFile(filePath, { duration: true });

  return {
    filePath: filePath,
    duration: trackMetadata.format.duration || 0,
    artists: parseID3V2Array(trackMetadata.common.artists),
    year: trackMetadata.common.year || 0,
    title: trackMetadata.common.title || "",
    genres: parseID3V2Array(trackMetadata.common.genre),
    hasCover:
      !!trackMetadata.common.picture && trackMetadata.common.picture.length > 0,
  };
}
