import path from "path";
import fs from "fs/promises";
import { describe, expect, it, jest, beforeAll, afterAll } from "@jest/globals";
import {
  getExtensionName,
  parseID3V2Array,
  logDBError,
  isFileExist,
} from "./index";

describe("getExtensionName", () => {
  it("returns file extension", () => {
    jest.spyOn(path, "extname").mockImplementation(() => ".flac");

    const result = getExtensionName("/path/to/file.flac");

    expect(result).toBe("flac");
  });

  it("returns file extension in as lowercase letters", () => {
    jest.spyOn(path, "extname").mockImplementation(() => ".FLAC");

    const result = getExtensionName("/filename.FLAC");

    expect(result).toBe("flac");
  });

  it("throws an error if we pass an empty string", () => {
    jest.spyOn(path, "extname").mockImplementation(() => "");

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

  describe("in development environment", () => {
    let OLD_ENV: string;

    beforeAll(() => {
      OLD_ENV = process.env.NODE_ENV!;
      process.env.NODE_ENV = "development";
    });

    afterAll(() => {
      process.env.NODE_ENV = OLD_ENV!;
    });

    it("logs an error, if error is an instance of Error", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      logDBError(errMsg, err);

      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.stringMatching(/Something went wrong - Error: db error/),
      );
    });

    it("logs an error, if error is not an instance of Error class", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      logDBError(errMsg, "some error text");

      expect(spy).toBeCalledWith(errMsg + " - some error text");
    });
  });

  describe("in production environment", () => {
    let OLD_ENV: string;

    beforeAll(() => {
      OLD_ENV = process.env.NODE_ENV!;
      process.env.NODE_ENV = "production";
    });

    afterAll(() => {
      process.env.NODE_ENV = OLD_ENV!;
    });

    it("logs an empty string, if error is an instance of Error", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      logDBError(errMsg, err);

      expect(spy).toHaveBeenCalledWith("");
    });

    it("logs an error, if error is not an instance of Error class", () => {
      const spy = jest.spyOn(console, "error").mockImplementation(() => {});

      logDBError(errMsg, "some error text");

      expect(spy).toBeCalledWith(errMsg + " - some error text");
    });
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
