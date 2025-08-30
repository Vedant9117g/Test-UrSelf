import React, { useState } from "react";
import { useTheme } from "./components/ThemeProvider";
import { Moon, Sun } from "lucide-react";

const DarkMode = () => {
  const { setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
      >
        <Sun className="h-5 w-5 dark:hidden" />
        <Moon className="h-5 w-5 hidden dark:block" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg">
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setTheme("light"); setIsOpen(false); }}>
            Light
          </button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setTheme("dark"); setIsOpen(false); }}>
            Dark
          </button>
          <button className="block w-full px-4 py-2 text-left hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => { setTheme("system"); setIsOpen(false); }}>
            System
          </button>
        </div>
      )}
    </div>
  );
};

export default DarkMode;
