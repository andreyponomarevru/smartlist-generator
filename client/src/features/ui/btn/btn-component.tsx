import React from "react";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  onClick: () => void;
  isDisabled: boolean;
}

export function Btn(props: Props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`btn ${props.className || ""} `}
      disabled={props.isDisabled}
    >
      {props.children}
    </button>
  );
}
