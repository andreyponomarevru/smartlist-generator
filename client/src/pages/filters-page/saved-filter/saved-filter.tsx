import React from "react";
import { FaRegTrashAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";

import { MdModeEdit } from "react-icons/md";
import { FilterFormValues } from "../../../types";
import { useEditableText } from "../../../hooks/use-editable-text";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  filterId: string;
  filter: FilterFormValues;
  handleEdit: () => void;
  handleDestroy: () => void;
  handleRename: (id: string, inputs: FilterFormValues) => void;
}

export function SavedFilter(props: SavedFilterProps) {
  const savedFilterName = useEditableText(props.name);

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (savedFilterName.state.text !== props.name) {
      //props.handleRename(props.savedFilterId, savedFilterName.state.text);
    }
  }, [savedFilterName.state.text, props.name]);

  return (
    <div className="saved-filter">
      <header
        className="saved-filter__header"
        onClick={() => setIsOpen((prev) => !prev)}
        role="presentation"
      >
        {savedFilterName.state.text}
        {/*<EditableText editable={savedFilterName} />*/}
        <div className="saved-filter__toggle-btn">
          {isOpen ? (
            <FaChevronUp className="icon" />
          ) : (
            <FaChevronDown className="icon" />
          )}
        </div>
        <div className="saved-filter__btns">
          <button
            className="saved-filter__btn"
            onClick={(e) => {
              e.stopPropagation();
              props.handleEdit();
            }}
          >
            <MdModeEdit className="icon" />
          </button>
          <button
            className="saved-filter__btn"
            onClick={(e) => {
              e.stopPropagation();
              props.handleDestroy();
            }}
          >
            <FaRegTrashAlt className="icon" />
          </button>
        </div>
      </header>

      {isOpen && (
        <div className="saved-filter__body">
          <div className="saved-filter__operator">
            {props.filter.operator.value.toUpperCase()}
          </div>
          <ul className="saved-filter__details-list">
            {props.filter.filters.map((f, index) => {
              return (
                <li
                  key={
                    index +
                    f.name.value +
                    (f.condition ? f.condition.value : "")
                  }
                  className="saved-filter__row"
                >
                  <span className="saved-filter__col1">{f.name.label}</span>
                  <span className="saved-filter__col2">
                    {f.condition?.label}
                  </span>
                  <span className="saved-filter__col3">
                    {Array.isArray(f.value) ? (
                      f.value.map((v, index) => (
                        <span
                          key={v.label + index}
                          className="saved-filter__genre"
                        >
                          {v.label}
                        </span>
                      ))
                    ) : (
                      <span>{f.value?.label}</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
