import React from "react";

import { useGetStatsQuery } from "../../stats";
import { selectExcludedTracksIds } from "../excluded-tracks-slice";
import { useAppSelector } from "../../../hooks/redux-ts-helpers";

function calcExcludedStats(excludedCount = 0, stats: { count: number }[] = []) {
  const totalCount =
    stats.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;
  const tracksLeft = totalCount - excludedCount;

  return {
    totalCount,
    excludedPercentage:
      totalCount === 0 && excludedCount === 0
        ? 0
        : Number(((100 * excludedCount) / totalCount).toFixed(1)),
    tracksLeft,
  };
}

export function ExcludedTracksStats() {
  const excludedTracks = useAppSelector(selectExcludedTracksIds);
  const stats = useGetStatsQuery(excludedTracks);
  const { totalCount, excludedPercentage, tracksLeft } = calcExcludedStats(
    excludedTracks.length,
    stats.data?.years,
  );

  return (
    <span>
      <span className="settings-page__highlighting settings-page__highlighting_primary">
        {excludedTracks.length} ({excludedPercentage}%)
      </span>{" "}
      out of{" "}
      <span className="settings-page__highlighting settings-page__highlighting_primary">
        {totalCount}
      </span>{" "}
      tracks were excluded.{" "}
      <span className="settings-page__highlighting settings-page__highlighting_primary">
        {tracksLeft}
      </span>{" "}
      tracks left
    </span>
  );
}
