export const themeStyles = {
  light: {
    font: "'Inter', sans-serif",
    textColor: "#111",
    accent: "#007bff",

    colors: {
      // Background hierarchy
      background: "linear-gradient(to bottom right, #f9f9f9, #e0e0e0)", // page background
      primary: "#ffffff",       // cards, panels
      secondary: "#f0f4f8",     // sidebar, surface
      tertiary: "#e0e7ff",      // hover/active highlights
      quaternary: "#f8fafc",    // subtle surface / section separation

      // Text
      text: "#111",
      textSecondary: "#555",
      muted: "#888",
      link: "#007bff",
      heading: "#111",

      // Semantic colors
      success: "#16a34a",
      error: "#dc2626",
      warning: "#f59e0b",
      info: "#0ea5e9",

      // Interaction states
      hover: "#e0f2ff",
      focus: "#c7ddff",
      active: "#b0d4ff",
    },

    button: {
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",
    },

    input: "bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none",
  },

  dark: {
    font: "'Poppins', sans-serif",
    textColor: "#e0e0e0",
    accent: "#00bcd4",

    colors: {
      background: "linear-gradient(to bottom right, #1e1e1e, #121212)",
      primary: "#1c1c1c",
      secondary: "#161616",
      tertiary: "#222222",
      quaternary: "#0f0f0f",

      text: "#e0e0e0",
      textSecondary: "#aaa",
      muted: "#555",
      link: "#00bcd4",
      heading: "#fff",

      success: "#22c55e",
      error: "#f87171",
      warning: "#facc15",
      info: "#0ea5e9",

      hover: "#222222",
      focus: "#2c2c2c",
      active: "#333333",
    },

    button: {
      primary: "bg-teal-500 text-black hover:bg-teal-400",
      secondary: "bg-transparent border border-teal-500 text-teal-400 hover:bg-teal-900/30",
    },

    input: "bg-[#121212] border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none",
  },

  classroom: {
    font: "'Shadows Into Light', cursive",
    textColor: "#f8f8f2",
    accent: "#aaff88",

    colors: {
      background: "#0d0d0d",
      primary: "#1a2a1a",
      secondary: "#121a12",
      tertiary: "#223322",
      quaternary: "#0b1d0b",

      text: "#f5f5f5",
      textSecondary: "#ccc",
      muted: "#888",
      link: "#aaff88",
      heading: "#f5f5f5",

      success: "#22c55e",
      error: "#f87171",
      warning: "#facc15",
      info: "#0ea5e9",

      hover: "#223322",
      focus: "#334433",
      active: "#445544",
    },

    button: {
      primary: "bg-[#aaff88] text-black hover:bg-[#88ff66]",
      secondary: "bg-transparent border border-[#aaff88] text-[#aaff88] hover:bg-[#223322]",
    },

    input: "bg-[#1a2a1a] border border-[#2c3a2c] text-[#f5f5f5] placeholder-gray-400 focus:ring-2 focus:ring-[#aaff88] focus:outline-none",
  },

  coder: {
    font: "'Fira Code', monospace",
    textColor: "#f5f5f5",
    accent: "#FFA116",

    colors: {
      background: "linear-gradient(to bottom right, #1a1a1a, #222222)",
      primary: "#2a2a2a",
      secondary: "#242424",
      tertiary: "#333333",
      quaternary: "#1f1f1f",

      text: "#f5f5f5",
      textSecondary: "#aaa",
      muted: "#555",
      link: "#f59e0b",
      heading: "#fff",

      success: "#22c55e",
      error: "#f87171",
      warning: "#facc15",
      info: "#0ea5e9",

      hover: "#333333",
      focus: "#444444",
      active: "#555555",
    },

    button: {
      primary: "bg-[#f59e0b] text-black hover:bg-[#eab308]",
      secondary: "bg-transparent border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b33]",
    },

    input: "bg-[#2a2a2a] border border-[#3a3a3a] text-[#f5f5f5] placeholder-gray-500 focus:ring-2 focus:ring-[#f59e0b] focus:outline-none",
  },
};
