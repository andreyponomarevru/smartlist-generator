import React from "react";

import { Stats } from "./stats";
import { Loader } from "../../lib/loader/loader";
import { useGlobalState } from "../../hooks/use-global-state";
import { Message } from "../../lib/message/message";

import "./stats-page.scss";

export function StatsPage() {
  const { statsQuery } = useGlobalState();

  if (statsQuery.isLoading) return <Loader for="page" color="black" />;

  if (statsQuery.error || !statsQuery.data) {
    return (
      <Message type="danger">
        Something went wrong while loading stats :(
      </Message>
    );
  }

  const totalCount =
    statsQuery.data?.years.results?.reduce(
      (accumulator, currentValue) => accumulator + currentValue.count,
      0,
    ) || 0;

  return (
    <div className="stats-page">
      <header className="header1">Statistics</header>

      <section>
        <h2 className="stats-page__header2">Tracks ({totalCount})</h2>
      </section>
      <Stats stats={statsQuery.data.years.results} name="Years" />
      <Stats stats={statsQuery.data.genres.results} name="Genres" />
    </div>
  );
}
