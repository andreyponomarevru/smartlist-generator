import * as React from "react";
import { Stats, APIResponse, GetStatsRes } from "../../types";
import { Message } from "../message/message";
import { Loader } from "../loader/loader";

import "./stats.scss";

interface Props extends React.HTMLAttributes<HTMLElement> {
  stats: APIResponse<GetStatsRes>;
}

export function Stats(props: Props) {
  return (
    <section className={`stats ${props.className || ""}`}>
      <header className="stats__header">
        <span>{props.title}</span>
        <span>{props.stats.response?.body?.results.length || 0}</span>
      </header>

      {props.stats.isLoading && <Loader for="page" color="pink" />}

      {props.stats.error && (
        <Message type="danger">Something went wrong :(</Message>
      )}

      <ul className="stats__list">
        {props.stats.response?.body?.results &&
          props.stats.response?.body?.results.map((entry) => {
            return (
              <li key={entry.id || entry.name} className="stats__row">
                <span>{entry.name}</span>
                <span>{entry.count}</span>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
