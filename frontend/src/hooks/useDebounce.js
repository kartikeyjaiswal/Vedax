import { useState, useEffect } from 'react';

/**
 * Simple debounce hook.
 * Returns a debounced value that updates after the specified delay.
 */
export const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
};
