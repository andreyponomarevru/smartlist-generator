import fs from "fs/promises";
import mockfs from "mock-fs";
import { describe, expect, it, jest, afterEach } from "@jest/globals";
import {
  traverseDirs,
  getExtensionName,
  parseID3V2Array,
  logDBError,
  isFileExist,
} from "./index";

const mockSupportedCodecGetter = jest.fn();
jest.mock("../config/env", () => ({
  get SUPPORTED_CODEC() {
    return mockSupportedCodecGetter();
  },
}));

describe("getExtensionName", () => {
  it("returns file extension", () => {
    const result = getExtensionName("/path/to/file.flac");

    expect(result).toBe("flac");
  });

  it("returns file extension if there are two dots before extension", () => {
    const result = getExtensionName("/filename..flac");

    expect(result).toBe("flac");
  });

  it("returns file extension in as lowercase letters", () => {
    const result = getExtensionName("/filename.FLAC");

    expect(result).toBe("flac");
  });

  it("throws an error if we pass an empty string", () => {
    const result = () => getExtensionName("");

    expect(result).toThrow("Can't be an empty string");
  });
});

describe("parseID3V2Array", () => {
  it("returns an array parsed", () => {
    const result = parseID3V2Array(["ambient", "rock", "jungle"]);

    expect(result).toEqual(["ambient", "rock", "jungle"]);
  });

  describe("returns an erray which", () => {
    it("is empty if nothing is passed", () => {
      const result = parseID3V2Array();

      expect(result).toEqual([]);
    });

    it("is empty if an empty array is passed", () => {
      const result = parseID3V2Array([]);

      expect(result).toEqual([]);
    });

    it("contains only unique items, if duplicates are passed", () => {
      const result = parseID3V2Array(["ambient", "rock", "ambient", "rock"]);

      expect(result).toEqual(["ambient", "rock"]);
    });

    it("doesnt contain a tag if it was an empty string", () => {
      const result = parseID3V2Array(["ambient", "      ", "rock"]);

      expect(result).toEqual(["ambient", "rock"]);
    });

    it("contains all items trimmed, if there are blank spaces around string", () => {
      const result = parseID3V2Array(["   ambient", "rock    ", "  house   "]);

      expect(result).toEqual(["ambient", "rock", "house"]);
    });
  });
});

describe("logDBError", () => {
  const errMsg = "Something went wrong";
  const err = new Error("db error");

  it("calls console.error with error text", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    logDBError(errMsg, err);

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/Something went wrong - Error: db error/),
    );
  });

  it("logs an error if it's an instance of Error", () => {});

  it("logs an error stack in development environment, if it's an instance of Error", () => {
    const OLD_ENV = process.env.NODE_ENV;
    jest.resetModules();
    process.env.NODE_ENV = "development";
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    logDBError(errMsg, err);

    expect(spy).toHaveBeenCalledWith(
      expect.stringMatching(/Something went wrong - Error: db error/),
    );

    process.env.NODE_ENV = OLD_ENV;
  });

  it("logs an empty string in production environment, if it's an instance of Error", () => {
    const OLD_ENV = process.env.NODE_ENV;
    jest.resetModules();
    process.env.NODE_ENV = "production";
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    logDBError(errMsg, err);

    expect(spy).toHaveBeenCalledWith("");

    process.env.NODE_ENV = OLD_ENV;
  });

  it("logs an error if its not an instance of Error", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});

    logDBError(errMsg, "some error text");

    expect(spy).toBeCalledWith(errMsg + " - some error text");
  });
});

describe("isFileExist", () => {
  it("returns true if file exists", async () => {
    jest.spyOn(fs, "access").mockResolvedValue(undefined);

    const exists = await isFileExist("./file.mp3");

    expect(exists).toBe(true);
  });

  it("returns false if file doesn't exist", async () => {
    jest.spyOn(fs, "access").mockRejectedValue(undefined);

    const exists = await isFileExist("./file.mp3");

    expect(exists).toBe(false);
  });
});

describe("traverseDirs", () => {
  const ROOT_DIR = "some dir";

  afterEach(() => {
    mockfs.restore();
  });

  it("invokes the callback with track's file path for every track in the current dir and subdirectories", async () => {
    mockfs(
      {
        [ROOT_DIR]: {
          "artist - song name 1.flac": Buffer.from([]),
          "artist - song name 2.flac": Buffer.from([]),
          "artwork.jpg": Buffer.from([]),
          "some dir2": {
            "some dir3": { "artist - song name 3.flac": Buffer.from([]) },
          },
        },
      },
      { createCwd: false, createTmp: false },
    );
    const mockCallback = jest.fn<(nodePath: string) => Promise<void>>();
    mockSupportedCodecGetter.mockReturnValue(["flac", "mp3"]);

    await traverseDirs(ROOT_DIR, mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(3);
    expect(mockCallback.mock.calls[0]).toEqual([
      `${ROOT_DIR}/artist - song name 1.flac`,
    ]);
    expect(mockCallback.mock.calls[1]).toEqual([
      `${ROOT_DIR}/artist - song name 2.flac`,
    ]);
    expect(mockCallback.mock.calls[2]).toEqual([
      `${ROOT_DIR}/some dir2/some dir3/artist - song name 3.flac`,
    ]);
  });

  it("invokes the callback only for tracks having extentions provided via SUPPORTED_CODEC env var", async () => {
    mockfs(
      {
        [ROOT_DIR]: {
          "flac file.flac": Buffer.from([]),
          "jpg file.jpg": Buffer.from([]),
          "wav file.wav": Buffer.from([]),
          "ogg file.ogg": Buffer.from([]),
          "aiff file.aiff": Buffer.from([]),
          "mp4 file.mp4": Buffer.from([]),
          "ape file.ape": Buffer.from([]),
          "mp3 file.mp3": Buffer.from([]),
          "m4a file.m4a": Buffer.from([]),
        },
      },
      { createCwd: false, createTmp: false },
    );
    const mockCallback = jest.fn<(nodePath: string) => Promise<void>>();
    mockSupportedCodecGetter.mockReturnValue(["flac", "mp3"]);

    await traverseDirs(ROOT_DIR, mockCallback);

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback.mock.calls[0]).toEqual([`${ROOT_DIR}/flac file.flac`]);
    expect(mockCallback.mock.calls[1]).toEqual([`${ROOT_DIR}/mp3 file.mp3`]);
  });

  it("does not throw an error if the callback throws an error", async () => {
    mockfs(
      { [ROOT_DIR]: { "flac file.flac": Buffer.from([]) } },
      { createCwd: false, createTmp: false },
    );
    mockSupportedCodecGetter.mockReturnValue(["flac", "mp3"]);
    async function callback(nodePath: string) {
      throw new Error();
    }
    const result = async () => await traverseDirs(ROOT_DIR, callback);

    expect(result).not.toThrow();
  });

  it("logs an error if the callback throws an error", async () => {
    mockfs(
      { [ROOT_DIR]: { "flac file.flac": Buffer.from([]) } },
      { createCwd: false, createTmp: false },
    );
    mockSupportedCodecGetter.mockReturnValue(["flac", "mp3"]);
    async function callback(nodePath: string) {
      throw new Error("Some error");
    }
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(jest.fn());

    await traverseDirs(ROOT_DIR, callback);

    const firstCallFirstArg = consoleSpy.mock.calls[0][0];
    expect(firstCallFirstArg).toMatch(
      "[Error. Skip file some dir/flac file.flac]",
    );
  });
});
