import { describe, expect, it, jest, test } from "@jest/globals";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import {
  buildFilterQuery,
  encodeRFC3986URIComponent,
  toHourMinSec,
  extractFilename,
  getRTKQueryErr,
  buildFindTrackReqBody,
} from "./index";
import { Filter, FilterFormValues, FilterQuery } from "../types";
import {
  OPERATORS,
  FILTER_NAMES,
  FILTER_CONDITIONS,
} from "../features/filters/filter-editing/constants";

describe("getRTKQueryErr", () => {
  it("returns the stringified 'data' field, if a FetchBaseQueryError is passed", () => {
    const data = "Unknown data";
    const err: FetchBaseQueryError = { data, status: 1 };

    const result = getRTKQueryErr(err);

    expect(result).toBe(JSON.stringify(data));
  });

  it("returns the 'message' field, if neither a FetchBaseQueryError, nor an unknown error is passed", () => {
    const err = { message: "text" };

    const result = getRTKQueryErr(err);

    expect(result).toBe("text");
  });

  describe("returns a non-empty string if an unknown error passed is a", () => {
    test.each([
      { err: "Some error" },
      { err: null },
      { err: undefined },
      { err: {} },
      { err: new Error("error") },
    ])("$err", ({ err }) => {
      const result = typeof getRTKQueryErr(err);

      expect(result).toBe("string");
      expect(result).not.toBe("");
    });
  });
});

describe("extractFilename", () => {
  it("extracts file name if the file is in multiple sub directories", () => {
    const path = "/no-one/likes/veggies.flac";

    const result = extractFilename(path);

    expect(result).toBe("veggies.flac");
  });

  it("extracts file name if the file is at the root of the path", () => {
    const path = "/file.mp3";

    const result = extractFilename(path);

    expect(result).toBe("file.mp3");
  });

  it("returns empty string if the path ends with a forward slash", () => {
    const path = "file name/";

    const result = extractFilename(path);

    expect(result).toBe("");
  });

  describe("doesn't throw an error if", () => {
    test.each([{ path: "" }, { path: "/" }, { path: "d/" }])(
      "$path",
      ({ path }) => {
        const result = () => extractFilename(path);

        expect(result).not.toThrow();
      },
    );
  });

  it("returns the path as is, if it is an invalid path", () => {
    const invalidPath = "invalid path.flac";

    const result = extractFilename(invalidPath);

    expect(result).toBe(invalidPath);
  });
});

describe("toHourMinSec", () => {
  it("returns hh:mm if the duration is zero", () => {
    const result = toHourMinSec(0);

    expect(result).toBe("00:00");
  });

  it("returns hh:mm if the durations is less than one hour", () => {
    const result = toHourMinSec(800);

    expect(result).toBe("13:20");
  });

  it("returns hh:mm:ss if the duration is more than one hour", () => {
    const result = toHourMinSec(8000);

    expect(result).toBe("02:13:20");
  });

  describe("throws an error if the duration is", () => {
    test.each([
      { sec: -800 },
      { sec: Infinity },
      { sec: -Infinity },
      { sec: NaN },
    ])("$sec", ({ sec }) => {
      const result = () => toHourMinSec(sec);

      expect(result).toThrow();
    });
  });
});

describe("encodeRFC3986URIComponent", () => {
  it("encodes an exclamation mark", () => {
    const result = encodeRFC3986URIComponent("!");

    expect(result).toBe("%21");
  });

  it("encodes a single quotation mark", () => {
    const result = encodeRFC3986URIComponent("'");

    expect(result).toBe("%27");
  });

  it("encodes a parentheses", () => {
    const result = encodeRFC3986URIComponent("()");

    expect(result).toBe("%28%29");
  });

  it("encodes an asterisk", () => {
    const result = encodeRFC3986URIComponent("*");

    expect(result).toBe("%2A");
  });

  it("encodes every encountered instance of exclamation mark, parentheses, asterisk in a string", () => {
    const sourceString =
      "file:///mnt/U6EB53CEA6464EBAD/music-lib/tracks/chillout_psy_tagged/Jon%20Brooks'%20-%20Appl!ed%20Music%20Vol%E2%80%8B.%E2%80%8B3%20-%20Land%20&%20Sea%20(2020)/10%20Glacial%20P()lain.flac";

    const result = encodeRFC3986URIComponent(sourceString);

    expect(result).toBe(
      "file:///mnt/U6EB53CEA6464EBAD/music-lib/tracks/chillout_psy_tagged/Jon%2520Brooks%27%2520-%2520Appl%21ed%2520Music%2520Vol%25E2%2580%258B.%25E2%2580%258B3%2520-%2520Land%2520&%2520Sea%2520%282020%29/10%2520Glacial%2520P%28%29lain.flac",
    );
  });
});

describe("buildFilterQuery", () => {
  it("throws an error if the 'name' key is unsupported filter name", () => {
    const form: Filter = {
      name: { label: "unsupported filter name", value: "" },
      condition: FILTER_CONDITIONS.year.gte,
      value: { label: "2015", value: 2015 },
    };

    const result = () => buildFilterQuery(form);

    expect(result).toThrow("Invalid filter name");
  });

  it("returns 'name' key as a string", () => {
    const form: Filter = {
      name: { label: "Year", value: "year" },
      condition: FILTER_CONDITIONS.year.gte,
      value: { label: "2015", value: 2015 },
    };

    const query = buildFilterQuery(form);

    expect(typeof query.name).toBe("string");
  });

  it("throws an error if the 'condition' key is null", () => {
    const form: Filter = {
      name: FILTER_NAMES.genre,
      condition: null,
      value: { label: "ambient", value: 11 },
    };

    const result = () => buildFilterQuery(form);

    expect(result).toThrowError("'condition' can't be null");
  });

  it("returns 'condition' key as a string if the filter condition is a single object", () => {
    const form: Filter = {
      name: { label: "Year", value: "year" },
      condition: FILTER_CONDITIONS.year.gte,
      value: { label: "2015", value: 2015 },
    };

    const query = buildFilterQuery(form);

    expect(typeof query.condition).toBe("string");
  });

  it("returns 'value' key as a number if 'value' key is a single genre", () => {
    const form: Filter = {
      name: FILTER_NAMES.genre,
      condition: FILTER_CONDITIONS.genre.containsAll,
      value: { label: "ambient", value: 11 },
    };

    const query = buildFilterQuery(form);

    expect(query).toStrictEqual({
      name: expect.anything(),
      condition: expect.anything(),
      value: 11,
    });
  });

  it("returns 'value' key as an array of numbers if 'value' key is an array of genres", () => {
    const form: Filter = {
      name: FILTER_NAMES.genre,
      condition: FILTER_CONDITIONS.genre.containsAll,
      value: [
        { label: "ambient", value: 11 },
        { label: "rock", value: 6 },
        { label: "techno", value: 23 },
      ],
    };

    const query = buildFilterQuery(form);

    expect(query).toStrictEqual({
      name: expect.anything(),
      condition: expect.anything(),
      value: [11, 6, 23],
    });
  });

  it("returns 'value' key as a number if 'value' key is a single year", () => {
    const form: Filter = {
      name: FILTER_NAMES.year,
      condition: FILTER_CONDITIONS.year.gte,
      value: { label: "2015", value: 2015 },
    };

    const query = buildFilterQuery(form);

    expect(query).toStrictEqual({
      name: FILTER_NAMES.year.value,
      condition: FILTER_CONDITIONS.year.gte.value,
      value: 2015,
    });
  });

  it("throws an error if the 'name' key is 'year' and 'value' key is an array of years", () => {
    const form: Filter = {
      name: FILTER_NAMES.year,
      condition: FILTER_CONDITIONS.year.is,
      value: [
        { label: "2020", value: 2020 },
        { label: "1975", value: 1975 },
      ],
    };

    const result = () => buildFilterQuery(form);

    expect(result).toThrow("Year 'value' can't be an array");
  });

  it("throws an error if the 'value' key is null", () => {
    const form: Filter = {
      name: FILTER_NAMES.year,
      condition: FILTER_CONDITIONS.year.is,
      value: null,
    };

    const result = () => buildFilterQuery(form);

    expect(result).toThrow("'value' can't be null");
  });
});

describe("buildFindTrackReqBody", () => {
  const form: FilterFormValues = {
    name: "Filter name",
    operator: OPERATORS.any,
    filters: [],
  };
  const excludedTracks = [5, 97, 5683];
  function buildFilter(filter: Filter): FilterQuery {
    return {} as FilterQuery;
  }

  it("sets 'operator' key to the provided string", () => {
    const result = buildFindTrackReqBody(form, excludedTracks, buildFilter);

    expect(result.operator).toBe(OPERATORS.any.value);
  });

  it("sets 'excludeTracks' key to the provided array of track ids", () => {
    const result = buildFindTrackReqBody(form, excludedTracks, buildFilter);

    expect(result.excludeTracks).toEqual([5, 97, 5683]);
  });

  it("filter builder function is called for every provided filter", () => {
    const form: FilterFormValues = {
      name: "Filter name",
      operator: OPERATORS.any,
      filters: [
        {
          name: FILTER_NAMES.year,
          condition: FILTER_CONDITIONS.year.is,
          value: { label: "2015", value: 2025 },
        },
        {
          name: FILTER_NAMES.genre,
          condition: FILTER_CONDITIONS.genre.containsAll,
          value: [
            { label: "ambient", value: 13 },
            { label: "rock", value: 2 },
          ],
        },
      ],
    };

    const mockBuilder = jest.fn<typeof buildFilterQuery>();

    buildFindTrackReqBody(form, excludedTracks, mockBuilder);

    expect(mockBuilder).toHaveBeenCalledTimes(form.filters.length);
    expect(mockBuilder.mock.calls[0]).toStrictEqual([form.filters[0]]);
    expect(mockBuilder.mock.calls[1]).toStrictEqual([form.filters[1]]);
  });

  it("sets 'filters' key to an array", () => {
    const mockBuilder = jest.fn<typeof buildFilterQuery>(
      () => ({}) as FilterQuery,
    );

    const result = buildFindTrackReqBody(form, excludedTracks, mockBuilder);

    expect(result.filters).toBeInstanceOf(Array);
  });
});
