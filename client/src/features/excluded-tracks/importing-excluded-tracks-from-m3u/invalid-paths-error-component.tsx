import React from "react";

import { Message } from "../../ui/message";

import "./invalid-paths-error.scss";

export function InvalidPathsError(props: { text: string; paths: string[] }) {
  return (
    <Message type="warning" className="invalid-paths-error">
      <span className="invalid-paths-error__short-text">{props.text}</span>
      <ul className="invalid-paths-error__list">
        {props.paths.map((path, index) => (
          <li key={path + index} className="invalid-paths-error__list-item">
            {path}
          </li>
        ))}
      </ul>
    </Message>
  );
}
