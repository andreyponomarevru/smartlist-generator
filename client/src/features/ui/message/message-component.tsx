import React, { ReactElement } from "react";

import "./message.scss";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: "warning" | "success" | "info" | "danger" | "info" | "disabled";
}

export function Message(props: Props): ReactElement {
  return (
    <span className={`message message_${props.type} ${props.className || ""}`}>
      {props.children}
    </span>
  );
}
