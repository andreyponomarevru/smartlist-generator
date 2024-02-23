import * as React from "react";

import { FaPen } from "react-icons/fa";

import { State } from "../../hooks/use-editable-text";

import "./editable-text.scss";

interface EditableTextProps extends React.HTMLAttributes<HTMLFormElement> {
  editable: {
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
      {props.editable.state.isFormVisible ? (
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
            value={props.editable.state.inputValue}
            onChange={(e) => {
              e.stopPropagation();
              props.editable.handleInputChange(e);
            }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="btn btn_theme_black"
            onClick={(e) => {
              e.stopPropagation();
              props.editable.handleSave();
            }}
          >
            Save
          </button>
          <button
            className="btn btn_theme_black"
            onClick={(e) => {
              e.stopPropagation();
              props.editable.handleCancelEditing();
            }}
          >
            Cancel
          </button>
        </form>
      ) : (
        <span
          className={`editable-text ${props.className || ""}`}
          onClick={(e) => {
            e.stopPropagation();
            props.editable.handleEdit();
          }}
        >
          <span className={`editable-text__name`}>
            {props.editable.state.text}
          </span>
          <span className="editable-text__edit-btn">
            <FaPen />
          </span>
        </span>
      )}
    </div>
  );
}
