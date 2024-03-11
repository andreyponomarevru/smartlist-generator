import React from "react";
import ReactDOM from "react-dom";
import { IoClose } from "react-icons/io5";

import "./modal.scss";

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  activator: ({
    setIsVisible,
  }: {
    setIsVisible: React.Dispatch<React.SetStateAction<boolean>>;
  }) => React.ButtonHTMLAttributes<HTMLButtonElement>;
}

export function Modal(props: ModalProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  const content = isVisible && (
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
            onClick={() => setIsVisible(false)}
            className="modal__close-btn btn btn_type_icon btn_hover_grey-20 group__sort-btn"
          >
            <IoClose className="icon" />
          </button>
        </header>

        <div className="modal__body">{props.children}</div>
      </div>
    </div>
  );

  return (
    <>
      {props.activator({ setIsVisible })}
      {ReactDOM.createPortal(content, document.body)}
    </>
  );
}
