// Theme Context (for future theme switching)

import React, { createContext, useContext, useState, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // For now, only dark theme is supported
  // This context is a placeholder for future light/dark mode toggle
  const [theme, setTheme] = useState('dark');
  const [preferences, setPreferences] = useState({
    tableDensity: 'comfortable', // comfortable, compact, spacious
    animations: true
  });

  const toggleTheme = useCallback(() => {
    // Future implementation
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences((prev) => ({ ...prev, ...newPreferences }));
  }, []);

  const value = {
    theme,
    preferences,
    toggleTheme,
    updatePreferences
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
