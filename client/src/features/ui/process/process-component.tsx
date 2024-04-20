import React from "react";

import { SSEMessage } from "../../../types";

import "./process.scss";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  message: SSEMessage;
}

export function Process(props: Props) {
  const createdAt =
    props.message?.createdAt &&
    `Created at: ${new Date(props.message?.createdAt).toLocaleString()}`;

  const updatedAt =
    props.message?.updatedAt &&
    `Updated at: ${new Date(props.message?.updatedAt).toLocaleString()}`;

  return (
    <div
      className={`process process_status_${props.message?.status} ${
        props.className || ""
      }`}
    >
      <div className="process__list">
        <span className="process__list-item">{props.message.status}</span>
        <span className="process__list-item">{createdAt}</span>
        <span className="process__list-item">{updatedAt}</span>
      </div>

      {props.children}
    </div>
  );
}
