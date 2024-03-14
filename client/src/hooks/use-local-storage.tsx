import React from "react";

export function useLocalStorage<T>(key: string, defaultValue: T) {
  function getValue(key: string, defaultValue: T): T {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : defaultValue;
  }

  const [value, setValue] = React.useState<T>(() =>
    getValue(key, defaultValue),
  );

  React.useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
