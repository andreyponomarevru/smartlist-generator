import React from "react";

import { Stats } from "./stats";
import { Loader } from "../../lib/loader/loader";
import { useGlobalState } from "../../hooks/use-global-state";
import { Message } from "../../lib/message/message";
import { Header } from "../../lib/header/header1";

import "./stats-page.scss";

export function StatsPage() {
  const { statsQuery } = useGlobalState();

  if (statsQuery.isLoading) return <Loader for="page" color="pink" />;

  if (statsQuery.error || !statsQuery.data) {
    return (
      <Message type="danger">
        Something went wrong while loading stats :(
      </Message>
    );
  }

  return (
    <div className="stats-page">
      <Header>Statistics</Header>

      <section>
        <h2 className="stats-page__header2">
          Tracks (
          {statsQuery.data?.years.results?.reduce(
            (accumulator, currentValue) => accumulator + currentValue.count,
            0,
          )}
          )
        </h2>
      </section>
      <Stats stats={statsQuery.data.years.results} name="Years" />
      <Stats stats={statsQuery.data.genres.results} name="Genres" />
    </div>
  );
}
