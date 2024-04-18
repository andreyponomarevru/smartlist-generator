import React from "react";

import { Process } from "../../../types";

import "./process.scss";

interface ProcessProps extends React.HTMLAttributes<HTMLSpanElement> {
  details: Process;
}

export function Process(props: ProcessProps) {
  const createdAt =
    props.details?.createdAt &&
    `Created at: ${new Date(props.details?.createdAt).toLocaleString()}`;

  const updatedAt =
    props.details?.updatedAt &&
    `Updated at: ${new Date(props.details?.updatedAt).toLocaleString()}`;

  return (
    <div
      className={`process process_status_${props.details?.status} ${
        props.className || ""
      }`}
    >
      <div className="process__list">
        <span className="process__list-item">{props.details.status}</span>
        <span className="process__list-item">{createdAt}</span>
        <span className="process__list-item">{updatedAt}</span>
      </div>

      {props.children}
    </div>
  );
}
