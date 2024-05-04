import { describe, expect, it, jest } from "@jest/globals";

import { getPlaylistDuration } from "./index";

jest.mock("../../../utils", () => {
  const originalModule =
    jest.requireActual<typeof import("../../../utils")>("../../../utils");

  return {
    ...originalModule,
    toHourMinSec: jest.fn(() => "01:01:01"),
  };
});

describe("getPlaylistDuration", () => {
  const tracks = [{ duration: 100 }, { duration: 200.123 }, { duration: 300 }];

  it("returns playlist duration", () => {
    const result = getPlaylistDuration(tracks);

    expect(result).toBe("01:01:01");
  });
});
