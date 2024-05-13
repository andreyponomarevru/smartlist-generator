import { describe, expect, it, jest } from "@jest/globals";
import { ValidationError, ValidationErrorItem } from "joi";
import { TrackValidator } from "./track-validator";
import { schemaCreateTrack } from "./validation-schemas";
import { ParsedTrack } from "../../types";

jest.mock("./validation-schemas", () => ({
  schemaCreateTrack: { validateAsync: jest.fn() },
}));
jest.mock("../../utils", () => ({ parseID3V2Array: () => [] }));

describe("TrackValidator", () => {
  it("creates a new instance of validator containing required props", () => {
    const expected = {
      errors: [],
      stats: { artist: new Set(), genre: new Set(), year: new Set() },
      validate: expect.any(Function),
    };

    const validator = new TrackValidator(schemaCreateTrack);

    expect(validator).toEqual(expected);
    expect(validator.stats).toStrictEqual(expected.stats);
  });

  describe("validate", () => {
    it("validates the tracks", async () => {
      const track = {
        duration: 58785.12,
        artists: ["Solar Quest", "Tom Middleton"],
        year: 1996,
        title: "Tranquillity",
        genres: ["ambient", "downtempo"],
        filePath: "/path/to/file1",
        hasCover: true,
      };
      jest.mocked(schemaCreateTrack).validateAsync.mockResolvedValue(track);

      const validator = new TrackValidator(schemaCreateTrack);
      const result = await validator.validate(track);

      expect(result).toEqual(track);
    });

    it("throws an error if non-validation error happens during validation", async () => {
      jest
        .mocked(schemaCreateTrack)
        .validateAsync.mockRejectedValue(new Error("Some error"));

      const validator = new TrackValidator(schemaCreateTrack);
      const result = async () => await validator.validate({} as ParsedTrack);

      await expect(result).rejects.toThrow("Some error");
    });

    it("stores validation error if the one happens", async () => {
      const err: ValidationErrorItem = {
        message: "Validation error",
        path: ["genre"],
        type: "error",
        context: { value: "invalid value" },
      };
      jest
        .mocked(schemaCreateTrack)
        .validateAsync.mockRejectedValue(
          new ValidationError("fake error", [err], {}),
        );
      const validator = new TrackValidator(schemaCreateTrack);

      const result = async () =>
        await validator.validate({ filePath: "/path/to/file" } as ParsedTrack);

      await expect(result).not.toThrow();
      expect(validator.errors).toStrictEqual([
        {
          filePath: "/path/to/file",
          id3TagName: err.path[0],
          id3TagValue: err.context?.value,
          err: err.message,
        },
      ]);
    });

    it("collects tracks metadata into lib stats", async () => {
      const track1 = {
        duration: 26877.1747,
        artists: ["Kevin Yost", "Tom Middleton"],
        year: 1996,
        title: "Love Not Love",
        genres: ["deep house", "chillout", "lofi"],
        filePath: "/path/to/file2",
        hasCover: false,
      };
      const track2 = {
        duration: 58785.12,
        artists: ["Solar Quest", "Tom Middleton"],
        year: 2001,
        title: "Tranquillity",
        genres: ["ambient", "downtempo"],
        filePath: "/path/to/file1",
        hasCover: true,
      };
      jest
        .mocked(schemaCreateTrack)
        .validateAsync.mockResolvedValueOnce(track1)
        .mockResolvedValueOnce(track2);
      const validator = new TrackValidator(schemaCreateTrack);

      await validator.validate(track1);
      await validator.validate(track2);

      expect(validator.stats).toStrictEqual({
        artist: new Set([...track1.artists, ...track2.artists]),
        genre: new Set([...track1.genres, ...track2.genres]),
        year: new Set([track1.year, track2.year]),
      });
    });
  });
});
