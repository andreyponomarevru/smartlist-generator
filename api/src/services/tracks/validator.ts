import Joi, { ValidationError } from "joi";
import { ValidatedTrack, TrackValidatorError } from "../../types";

import * as mm from "music-metadata";

import { Track } from "../../types";

export async function parseAudioFile(filePath: string): Promise<Track> {
  function parseArray(arr?: string[]): string[] {
    if (Array.isArray(arr) && arr.length > 0) {
      // Use Set to get rid of duplicate items
      return [...new Set(arr.filter((str) => str.trim() !== ""))];
    } else {
      return [];
    }
  }

  const trackMetadata = await mm.parseFile(filePath);

  return {
    filePath: filePath,
    duration: trackMetadata.format.duration || 0,
    artists: parseArray(trackMetadata.common.artists),
    year: trackMetadata.common.year || 0,
    title: trackMetadata.common.title || "",
    genres: parseArray(trackMetadata.common.genre),
  } as Track;
}

export class TrackValidator {
  public errors: TrackValidatorError[];
  public db: { genre: Set<string>; artist: Set<string>; year: Set<number> };
  #schema: Joi.ObjectSchema<ValidatedTrack>;

  constructor(schema: Joi.ObjectSchema<ValidatedTrack>) {
    this.errors = [];
    this.db = { artist: new Set(), genre: new Set(), year: new Set() };
    this.#schema = schema;
    this.validate = this.validate.bind(this);
  }

  public async validate(filePath: string) {
    try {
      const parsedTrack = await this.#schema.validateAsync(
        await parseAudioFile(filePath),
      );
      this.db.year.add(parsedTrack.year);
      parsedTrack.genres.forEach((name) => this.db.genre.add(name));
      parsedTrack.artists.forEach((artist) => this.db.artist.add(artist));
    } catch (err) {
      if (err instanceof ValidationError) {
        err.details.forEach((err) =>
          this.errors.push({
            filePath: filePath,
            id3TagName: err.path[0],
            id3TagValue: err.context?.value,
            err: err.message,
          }),
        );
      } else {
        throw err;
      }
    }
  }
}
