import React from "react";

interface SubmitFormBtnProps extends React.HTMLAttributes<HTMLButtonElement> {
  groupId: number;
}

export function SubmitFormBtn(props: SubmitFormBtnProps) {
  return (
    <button
      name="a"
      type="submit"
      disabled={false}
      form={`filter-form-${props.groupId}`}
      className={`btn btn_theme_black ${props.className || ""}`}
    >
      Find track
    </button>
  );
}
