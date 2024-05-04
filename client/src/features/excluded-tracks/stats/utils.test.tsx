import { describe, expect, it } from "@jest/globals";

import { calcExcludedStats } from "./utils";

describe("calcExcludedStats", () => {
  it("returns an object with calculated stats", () => {
    const result = calcExcludedStats(24, [
      { count: 20 },
      { count: 3950 },
      { count: 9 },
      { count: 309 },
      { count: 60 },
    ]);

    expect(result).toStrictEqual({
      totalCount: 4348,
      excludedPercentage: 0.6,
      tracksLeft: 4324,
    });
  });

  it("doesn't throw an error if excludedCount is bigger than the total number of tracks", () => {
    const result = () => calcExcludedStats(1, []);
    expect(result).not.toThrow(
      "excludedCount can't be bigger than total number of tracks",
    );
  });

  it("throws an error if excludedCount is non-integer", () => {
    const result = () => calcExcludedStats(5.27);

    expect(result).toThrow("excludedCount should be an integer");
  });

  describe("returns an object with all keys set to 0", () => {
    const expected = {
      totalCount: 0,
      excludedPercentage: 0,
      tracksLeft: 0,
    };

    it("if no arguments provided", () => {
      const result = calcExcludedStats();

      expect(result).toStrictEqual(expected);
    });

    it("if excludedCount is NaN", () => {
      const result = calcExcludedStats(NaN);

      expect(result).toStrictEqual(expected);
    });

    it("if excludedCount is Infinity", () => {
      const result = calcExcludedStats(Infinity);

      expect(result).toStrictEqual(expected);
    });

    it("if excludedCount is -Infinity", () => {
      const result = calcExcludedStats(-Infinity);

      expect(result).toStrictEqual(expected);
    });

    it("if excludedCount is a negative number", () => {
      const result = calcExcludedStats(-10);

      expect(result).toStrictEqual(expected);
    });
  });
});
