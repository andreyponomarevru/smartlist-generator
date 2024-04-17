import React from "react";

import { Message } from "../message/message-component";
import { APIResponseError } from "../../../types";

import "./api-error-msg.scss";

interface APIErrorProps extends React.HTMLAttributes<HTMLElement> {
  error: APIResponseError;
  className?: string;
}

export function APIErrorMessage(props: APIErrorProps) {
  return (
    <Message type="danger" className={`api-error-msg ${props.className || ""}`}>
      <span className="api-error-msg__name">{props.error.message}</span>&nbsp;
      <span>{props.error.message}</span>
    </Message>
  );
}
