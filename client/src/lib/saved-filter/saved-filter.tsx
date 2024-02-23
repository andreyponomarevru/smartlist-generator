import React from "react";
import { FaRegTrashAlt } from "react-icons/fa";

import { FilterFormValues } from "../../types";
import { EditableText } from "../editable-text/editable-text";
import { useEditableText } from "../../hooks/use-editable-text";

import "./saved-filter.scss";

interface SavedFilterProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  templateId: string;
  template: FilterFormValues;
  handleDestroyTemplate: () => void;
  handleRenameTemplate: (id: string, newName: string) => void;
}

export function SavedFilter(props: SavedFilterProps) {
  const templateName = useEditableText(props.name);

  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    if (templateName.state.text !== props.name) {
      props.handleRenameTemplate(props.templateId, templateName.state.text);
    }
  }, [templateName.state.text]);

  return (
    <div className="saved-filter">
      <div
        className="saved-filter__name"
        onClick={(e) => setIsOpen((prev) => !prev)}
      >
        <EditableText editable={templateName} />
        <button
          className="saved-filter__delete-btn"
          onClick={(e) => {
            e.stopPropagation();
            props.handleDestroyTemplate();
          }}
        >
          <FaRegTrashAlt className="icon" />
        </button>
      </div>
      {isOpen && (
        <div className="saved-filter__body">
          <div className="saved-filter__operator">
            {props.template.operator.value.toUpperCase()}
          </div>
          <div>
            {props.template.filters.map((f) => {
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
