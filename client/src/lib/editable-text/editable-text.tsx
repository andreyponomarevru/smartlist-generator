import * as React from "react";

import { FaPen } from "react-icons/fa";

import { State } from "../../hooks/use-editable-text";

import "./editable-text.scss";

interface EditableTextProps extends React.HTMLAttributes<HTMLFormElement> {
  text: {
    state: State;
    handleEdit: () => void;
    handleCancelEditing: () => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => void;
  };
}

export function EditableText(props: EditableTextProps) {
  return (
    <div className="editable-text">
      {props.text.state.isFormVisible ? (
        <form className={`editable-text__form ${props.className || ""}`}>
          <label className="editable-text__label" htmlFor="editable-text" />
          <input
            id="editable-text"
            className="editable-text__input"
            type="text"
            maxLength={255}
            minLength={1}
            name="editable-text"
            autoComplete="off"
            placeholder="Type a new name..."
            value={props.text.state.inputValue}
            onChange={props.text.handleInputChange}
          />
          <button
            className="btn btn_theme_black"
            onClick={props.text.handleSave}
          >
            Save
          </button>
          <button
            className="btn btn_theme_black"
            onClick={props.text.handleCancelEditing}
          >
            Cancel
          </button>
        </form>
      ) : (
        <span
          className={`editable-text ${props.className || ""}`}
          onClick={props.text.handleEdit}
        >
          <span className={`editable-text__name`}>{props.text.state.text}</span>
          <span className="editable-text__edit-btn">
            <FaPen />
          </span>
        </span>
      )}
    </div>
  );
}
