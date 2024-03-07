import React, { PropsWithChildren, ReactElement } from "react";

import "./message.scss";

interface Props extends React.HTMLAttributes<HTMLSpanElement> {
  type: "warning" | "success" | "info" | "danger" | "info" | "disabled";
}

export function Message(props: PropsWithChildren<Props>): ReactElement {
  return (
    <div className={`message message_${props.type} ${props.className || ""}`}>
      {props.children}
    </div>
  );
}
