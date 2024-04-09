import React from "react";

import { APIError } from "../../../utils";
import { Message } from "../message/message-component";

import "./api-error-msg.scss";

interface APIErrorProps extends React.HTMLAttributes<HTMLElement> {
  error: APIError;
  className?: string;
}

export function APIErrorMessage(props: APIErrorProps) {
  return (
    <Message type="danger" className={`api-error-msg ${props.className || ""}`}>
      <span className="api-error-msg__name">{props.error.name}</span>&nbsp;
      <span>{props.error.message}</span>
    </Message>
  );
}
