import React from "react";
import { IoClose } from "react-icons/io5";

import "./modal.scss";

import { useModal } from "./use-modal";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
}

export function Modal(props: ModalProps) {
  const { state, setState } = useModal();

  return (
    state.isVisible && (
      <div
        className="overlay"
        onClick={(e) => e.stopPropagation()}
        role="presentation"
      >
        <div className="modal">
          <header className="modal__header">
            <span className="modal__title">{props.title}</span>
            <button
              type="button"
              onClick={() => setState({ isVisible: false })}
              className="modal__close-btn btn btn_type_icon btn_hover_grey-20 group__sort-btn"
            >
              <IoClose className="icon" />
            </button>
          </header>

          <div className="modal__body">{props.children}</div>
        </div>
      </div>
    )
  );
}
