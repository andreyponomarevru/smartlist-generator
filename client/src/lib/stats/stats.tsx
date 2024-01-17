import * as React from "react";
import { StatsResponse, APIResponse } from "../../types";
import { StatsHeader } from "../stats-header/stats-header";
import { Message } from "../message/message";
import { Loader } from "../loader/loader";

import "./stats.scss";

interface Props {
  className?: string;
  stats: APIResponse<StatsResponse>;
}

export function Stats(props: Props) {
  const { stats } = props;

  return (
    <section className={`stats ${props.className || ""}`}>
      <StatsHeader
        title="Subplaylists"
        count={stats.response?.body?.results.length || 0}
      />

      {props.stats.isLoading && <Loader for="page" color="pink" />}
      {props.stats.error && (
        <Message type="danger">Something went wrong :(</Message>
      )}

      <ul className="stats__list">
        {props.stats.response?.body && (
          <>
            {...props.stats.response.body?.results.map((entry) => {
              return (
                <li key={entry.id} className="stats__row">
                  <span>{entry.name}</span>
                  <span className="stats__counter">{entry.count}</span>
                </li>
              );
            })}
          </>
        )}
      </ul>
    </section>
  );
}
