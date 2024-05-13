import Joi, { ValidationError } from "joi";
import { TrackValidatorError, ParsedTrack } from "../../types";

export class TrackValidator {
  public errors: TrackValidatorError[];
  public stats: {
    genre: Set<string>;
    artist: Set<string>;
    year: Set<number>;
  };
  #schema: Joi.ObjectSchema<ParsedTrack>;

  constructor(schema: Joi.ObjectSchema<ParsedTrack>) {
    this.errors = [];
    this.stats = { artist: new Set(), genre: new Set(), year: new Set() };
    this.#schema = schema;
    this.validate = this.validate.bind(this);
  }

  public async validate(track: ParsedTrack) {
    try {
      const validTrack = await this.#schema.validateAsync(track);

      this.stats.year.add(validTrack.year);
      validTrack.genres.forEach((name) => this.stats.genre.add(name));
      validTrack.artists.forEach((artist) => this.stats.artist.add(artist));

      return validTrack;
    } catch (err) {
      if (err instanceof ValidationError) {
        err.details.forEach((err) =>
          this.errors.push({
            filePath: track.filePath,
            id3TagName: err.path[0],
            id3TagValue: err.context?.value,
            err: err.message,
          }),
        );

        return this.errors;
      } else {
        throw err;
      }
    }
  }
}
