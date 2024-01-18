import * as React from "react";
import { GetStatsResponse, APIResponse } from "../../types";
import { Message } from "../message/message";
import { Loader } from "../loader/loader";

import "./stats.scss";

interface Props extends React.HTMLAttributes<HTMLElement> {
  stats: APIResponse<GetStatsResponse>;
  title: string;
}

export function Stats(props: Props) {
  return (
    <section className={`stats ${props.className || ""}`}>
      <header className="stats__header">
        <span className="stats__title">{props.title}</span>
        <span className="stats__header-count">
          {props.stats.response?.body?.results.length || 0}
        </span>
      </header>

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
