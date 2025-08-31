// import React from "react";
import { useTheme } from "../components/ThemeProvider";

export default function Landing() {
  const { theme, themeStyles } = useTheme();
  const colors = themeStyles[theme].colors;
  const font = themeStyles[theme].font;

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500`}
      style={{
        background: colors.background,
        color: colors.text,
        fontFamily: font,
      }}
    >
      <h1
        className="text-6xl font-bold mb-6"
        style={{ color: colors.heading }}
      >
        Welcome
      </h1>

      <p className="text-xl max-w-xl text-center mb-8" style={{ color: colors.textSecondary }}>
        Your ideas, beautifully themed ✨
      </p>

      <button
        className="px-8 py-3 rounded-xl text-lg border-2 transition-all duration-300"
        style={{
          backgroundColor: colors.accent,
          color: colors.text,
          borderColor: colors.accent,
        }}
      >
        Start
      </button>
    </div>
  );
}
