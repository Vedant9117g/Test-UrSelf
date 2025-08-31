import React, { createContext, useContext, useEffect, useState } from "react";
import { themeStyles } from "./themeStyles"; // hybrid theme styles

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("light");

  // Detect saved theme or fallback to system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && themeStyles[savedTheme]) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  // Persist theme in localStorage
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (themeStyles[newTheme]) {
      setTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: toggleTheme,
        styles: themeStyles[theme], // ✅ expose only active theme styles
        themeStyles, // ✅ also expose full theme list for buttons
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
