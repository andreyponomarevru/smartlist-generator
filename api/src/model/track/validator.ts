import Joi, { ValidationError } from "joi";
import { TrackMetadataParser } from "../../utils/utilities";
import { Track, ValidatedTrack, TrackValidatorError } from "../../types";

type DB = { [key: string]: Set<string | number> };

export class TrackValidator {
  public errors: TrackValidatorError[];
  public db: DB;
  #schema: Joi.ObjectSchema<ValidatedTrack>;

  constructor(schema: Joi.ObjectSchema<ValidatedTrack>) {
    this.errors = [];
    this.db = {
      artist: new Set(),
      genre: new Set(),
      year: new Set(),
    };
    this.#schema = schema;
    this.validate = this.validate.bind(this);
  }

  public async validate(filePath: string) {
    const trackMetadataParser = new TrackMetadataParser(filePath);
    try {
      const parsedTrack: Track = await this.#schema.validateAsync(
        await trackMetadataParser.parseAudioFile(),
      );
      this.db.year.add(parsedTrack.year);
      parsedTrack.genres.forEach((genre) => this.db.genre.add(genre));
      parsedTrack.artists.forEach((artist) => this.db.artist.add(artist));
    } catch (err) {
      if (err instanceof ValidationError) {
        err.details.forEach((err) =>
          this.errors.push({
            filePath: filePath,
            tag: err.path[0],
            value: err.context?.value,
            msg: err.message,
          }),
        );
      } else {
        console.log("Unknown type of error");
        throw err;
      }
    }
  }
}
