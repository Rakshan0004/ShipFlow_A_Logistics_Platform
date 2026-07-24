// Custom Hook for Polling API Calls

import { useEffect, useRef } from 'react';

/**
 * Custom hook for polling API calls at regular intervals
 * @param {Function} callback - Function to call on each poll
 * @param {number} interval - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 */
export function usePolling(callback, interval = 5000, enabled = true) {
  const savedCallback = useRef(callback);

  // Update the callback ref when it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the polling interval
  useEffect(() => {
    if (!enabled) return;

    const tick = () => {
      savedCallback.current();
    };

    // Call immediately on mount
    tick();

    // Then set up interval
    const id = setInterval(tick, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);
}
