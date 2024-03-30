import React from "react";

import { Stats } from "./stats/stats";
import { Loader } from "../../lib/loader/loader";
import { useGlobalState } from "../../hooks/use-global-state";
import { Message } from "../../lib/message/message";

import "./stats-page.scss";

export function StatsPage() {
  const { statsQuery } = useGlobalState();

  const totalCount =
    statsQuery.data?.years.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;

  return (
    <div className="stats-page">
      <header className="header1">Statistics</header>

      {statsQuery.isLoading && <Loader className="stats-page__loader" />}
      {statsQuery.error instanceof Error && (
        <Message type="danger">Request Failed</Message>
      )}

      <section>
        <h2 className="stats-page__header2">Tracks ({totalCount})</h2>
      </section>
      {statsQuery.data && <Stats stats={statsQuery.data.years} name="Years" />}
      {statsQuery.data && (
        <Stats stats={statsQuery.data.genres} name="Genres" />
      )}
    </div>
  );
}
