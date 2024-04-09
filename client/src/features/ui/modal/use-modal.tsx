import React from "react";

type Context = {
  state: { isVisible: boolean };
  setState: React.Dispatch<React.SetStateAction<{ isVisible: boolean }>>;
};

const INITIAL = { isVisible: false };

const ModalContext = React.createContext<Context>({
  state: INITIAL,
  setState: () => {},
});

function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(INITIAL);

  return (
    <ModalContext.Provider value={{ state, setState }}>
      {children}
    </ModalContext.Provider>
  );
}

function ModalConsumer() {
  return React.useContext(ModalContext);
}

export { ModalProvider, ModalConsumer as useModal };
