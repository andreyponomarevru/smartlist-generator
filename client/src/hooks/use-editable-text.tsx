import React from "react";

type Action =
  | { type: "SHOW_FORM" }
  | { type: "SAVE_INPUT" }
  | { type: "UPDATE_INPUT"; payload: { inputValue: string } }
  | { type: "CANCEL_INPUT" };

export type State = {
  isFormVisible: boolean;
  text: string;
  inputValue: string;
};

function editableTextReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SHOW_FORM": {
      return { ...state, isFormVisible: true };
    }
    case "SAVE_INPUT": {
      return { ...state, isFormVisible: false, text: state.inputValue };
    }
    case "UPDATE_INPUT": {
      return { ...state, inputValue: action.payload.inputValue };
    }
    case "CANCEL_INPUT": {
      return { ...state, isFormVisible: false, inputValue: state.text };
    }
    default: {
      throw new Error(`Unknown action ${action}`);
    }
  }
}

export function useEditableText(initialText: string) {
  const initialState: State = {
    isFormVisible: false,
    text: initialText,
    inputValue: initialText,
  };

  const [state, dispatch] = React.useReducer(editableTextReducer, initialState);

  function handleEdit() {
    dispatch({ type: "SHOW_FORM" });
  }

  function handleCancelEditing() {
    dispatch({ type: "CANCEL_INPUT" });
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    dispatch({ type: "UPDATE_INPUT", payload: { inputValue: e.target.value } });
  }

  function handleSave() {
    if (state.inputValue) {
      dispatch({ type: "SAVE_INPUT" });
    } else {
      dispatch({ type: "CANCEL_INPUT" });
    }
  }

  return {
    state,
    handleEdit,
    handleCancelEditing,
    handleInputChange,
    handleSave,
  };
}
