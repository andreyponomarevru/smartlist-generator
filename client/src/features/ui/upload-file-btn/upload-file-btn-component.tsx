import React from "react";

interface Props extends React.HTMLAttributes<HTMLElement> {
  onClick: (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
  multiple: boolean;
  isDisabled?: boolean;
}

export function UploadFileBtn(props: Props) {
  return (
    <label htmlFor={props.id}>
      <input
        id={props.id}
        type="file"
        onChange={props.onChange}
        onClick={props.onClick}
        multiple={props.multiple}
        hidden
        disabled={props.isDisabled}
      />
      <div className={`btn ${props.className || ""}`}>{props.children}</div>
    </label>
  );
}
