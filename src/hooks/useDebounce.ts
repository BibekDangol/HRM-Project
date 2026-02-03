import { useEffect, useState } from "react";

// JS DOC
/**
 * Returns a debounced value that only updates after the delay
 * @param value - the value to debounce
 * @param delay - time in ms to wait before updating
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup function runs if value changes before delay
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
