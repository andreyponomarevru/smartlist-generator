import { describe, expect, test } from "@jest/globals";
import {
  extractFilename,
  toHourMinSec,
  buildSearchQuery,
  exportPlaylistAsJSON,
  exportValidationReport,
  encodeRFC3986URIComponent,
  parseFileToStrings,
} from ".";

describe("extractFilename", () => {
  test("extracts the last part of the path", () => {
    expect(extractFilename("/no-one/likes/veggies")).toBe("veggies");
  });
});
