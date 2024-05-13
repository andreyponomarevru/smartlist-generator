import { describe, expect, it, jest } from "@jest/globals";

import { getPlaylistDuration } from "./index";
import { toHourMinSec } from "../../../utils";

jest.mock("../../../utils");

describe("getPlaylistDuration", () => {
  it("returns playlist duration", () => {
    jest.mocked(toHourMinSec).mockReturnValue("01:01:01");
    const tracks = [
      { duration: 100 },
      { duration: 200.123 },
      { duration: 300 },
    ];

    const result = getPlaylistDuration(tracks);

    expect(result).toBe("01:01:01");
  });
});
