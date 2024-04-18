import React from "react";

import { Stats, useGetStatsQuery } from "../features/stats";
import { Loader } from "../features/ui/loader";
import { Message } from "../features/ui/message";
import { isAPIErrorType } from "../utils";
import { useAppSelector } from "../hooks/redux-ts-helpers";
import { selectExcludedTracksIds } from "../features/excluded-tracks";

import "./stats-page.scss";

export function StatsPage() {
  const excludedTrackIds = useAppSelector(selectExcludedTracksIds);
  const stats = useGetStatsQuery(excludedTrackIds);

  const totalTracksCount =
    stats.data?.years.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;

  return (
    <div className={`stats-page ${stats.isFetching ? "dimmed" : ""}`}>
      <header className="header1">Statistics</header>
      <section>
        <h2 className="stats-page__header2">Tracks ({totalTracksCount})</h2>
      </section>

      {stats.isLoading && <Loader className="stats-page__loader" />}
      {stats.isSuccess && (
        <>
          <Stats stats={stats.data.years} name="Years" />
          <Stats stats={stats.data.genres} name="Genres" />
        </>
      )}
      {stats.isError && isAPIErrorType(stats.error) && (
        <Message type="danger">{stats.error.message}</Message>
      )}
    </div>
  );
}
