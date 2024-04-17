import React from "react";

import { Message } from "../../../ui/message";

import "./invalid-paths-error.scss";

export function InvalidPathsError(props: {
  shortText: string;
  paths: string[];
}) {
  return (
    <div className="invalid-paths-error">
      <Message type="warning" className="invalid-paths-error__msg">
        <span className="invalid-paths-error__short-text">
          {props.shortText}
        </span>
        <ul className="invalid-paths-error__list">
          {props.paths.map((path, index) => (
            <li key={path + index} className="invalid-paths-error__list-item">
              {path}
            </li>
          ))}
        </ul>
      </Message>
    </div>
  );
}
