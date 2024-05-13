import * as mm from "music-metadata";
import { describe, expect, it, jest } from "@jest/globals";
import { parseAudioFile } from "./parse-audio-file";

const parsedTrack = {
  common: {
    artists: ["The Future Sound Of London"],
    year: 1995,
    title: "Papua New Guinea",
    genre: ["breakbeat", "ambient"],
    picture: [{ format: "", data: Buffer.from([]) }],
  },
  format: { duration: 31875.4587 },
} as mm.IAudioMetadata;
jest.mock("music-metadata", () => ({ parseFile: jest.fn() }));

describe("parseAudioFile", () => {
  it("returns parsed audio file", async () => {
    jest.mocked(mm).parseFile.mockResolvedValue(parsedTrack);
    const trackPath = "/path/to*file";

    const result = await parseAudioFile(trackPath);

    expect(result).toStrictEqual({
      filePath: trackPath,
      duration: parsedTrack.format.duration,
      artists: parsedTrack.common.artists,
      year: parsedTrack.common.year,
      title: parsedTrack.common.title,
      genres: parsedTrack.common.genre,
      hasCover: true,
    });
  });

  describe("If the given id3v2 tag is undefined", () => {
    it("sets duration to 0", async () => {
      jest.mocked(mm).parseFile.mockResolvedValue({
        common: {},
        format: { duration: undefined },
      } as mm.IAudioMetadata);

      const result = await parseAudioFile("/path/to*file");

      expect(result.duration).toBe(0);
    });

    it("sets year to 0", async () => {
      jest.mocked(mm).parseFile.mockResolvedValue({
        common: {},
        format: { year: undefined },
      } as unknown as mm.IAudioMetadata);

      const result = await parseAudioFile("/path/to*file");

      expect(result.year).toBe(0);
    });

    it("sets title to empty string", async () => {
      jest.mocked(mm).parseFile.mockResolvedValue({
        common: { title: "" },
        format: {},
      } as mm.IAudioMetadata);

      const result = await parseAudioFile("/path/to*file");

      expect(result.title).toBe("");
    });
  });

  it("sets hasCover to false if there are no covers", async () => {
    jest.mocked(mm).parseFile.mockResolvedValue({
      common: { picture: [] },
      format: {},
    } as unknown as mm.IAudioMetadata);

    const result = await parseAudioFile("/path/to*file");

    expect(result.hasCover).toBe(false);
  });

  it("sets hasCover to true if there is at least one cover", async () => {
    jest.mocked(mm).parseFile.mockResolvedValue({
      common: { picture: [{}] },
      format: {},
    } as unknown as mm.IAudioMetadata);

    const result = await parseAudioFile("/path/to*file");

    expect(result.hasCover).toBe(true);
  });
});
