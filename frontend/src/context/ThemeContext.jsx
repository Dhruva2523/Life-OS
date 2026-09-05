import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('self_os_theme') || 'obsidian';
  });

  useEffect(() => {
    localStorage.setItem('self_os_theme', theme);
    const root = document.documentElement;
    if (theme === 'slate') {
      root.classList.add('theme-slate');
    } else {
      root.classList.remove('theme-slate');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'obsidian' ? 'slate' : 'obsidian'));
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
