import React from "react";
import { FaRegTrashAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";

import { FilterFormValues } from "../../types";
import { EditableText } from "../editable-text/editable-text";
import { useEditableText } from "../../hooks/use-editable-text";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  savedFilterId: string;
  filter: FilterFormValues;
  handleDestroy: () => void;
  handleRename: (id: string, newName: string) => void;
}

export function SavedFilter(props: SavedFilterProps) {
  const savedFilterName = useEditableText(props.name);

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (savedFilterName.state.text !== props.name) {
      props.handleRename(props.savedFilterId, savedFilterName.state.text);
    }
  }, [savedFilterName.state.text]);

  return (
    <div className="saved-filter">
      <div
        className="saved-filter__name"
        onClick={(e) => setIsOpen((prev) => !prev)}
      >
        <EditableText editable={savedFilterName} />

        <div className="saved-filter__controls">
          <button
            className="saved-filter__delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              props.handleDestroy();
            }}
          >
            <FaRegTrashAlt className="icon" />
          </button>
          <div className="saved-filter__toggle-btn">
            {isOpen ? (
              <FaChevronUp className="icon" />
            ) : (
              <FaChevronDown className="icon" />
            )}
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="saved-filter__body">
          <div className="saved-filter__operator">
            {props.filter.operator.value.toUpperCase()}
          </div>
          <div>
            {props.filter.filters.map((f) => {
              return (
                <div key={JSON.stringify(f)} className="saved-filter__row">
                  <span>{f.name.label}</span>
                  <span>{f.condition?.label}</span>
                  <span>
                    {Array.isArray(f.value) ? (
                      f.value.map((v) => v.label).join(", ")
                    ) : (
                      <span>{f.value?.label}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
