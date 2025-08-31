// themeStyles.js
export const themeStyles = {
  light: {
    // Global branding
    background: "linear-gradient(to bottom right, #f9f9f9, #e0e0e0)",
    textColor: "#111",
    accent: "#007bff",
    font: "'Inter', sans-serif",

    // Tailwind structure
    page: "bg-gray-100",
    surface: "bg-gray-50",
    card: "bg-white border border-gray-200 shadow-sm",

    text: "text-gray-800",
    textSecondary: "text-gray-600",
    muted: "text-gray-500",
    link: "text-blue-600 hover:underline",
    heading: "text-gray-900 font-bold",

    button: "bg-blue-600 text-white hover:bg-blue-700",
    buttonSecondary:
      "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50",

    input:
      "bg-white border border-gray-300 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none",

    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
  },

  dark: {
    background: "linear-gradient(to bottom right, #1e1e1e, #121212)",
    textColor: "#e0e0e0",
    accent: "#00bcd4",
    font: "'Poppins', sans-serif",

    page: "bg-[#0f0f0f]",
    surface: "bg-[#161616]",
    card: "bg-[#1c1c1c] border border-gray-700",

    text: "text-gray-200",
    textSecondary: "text-gray-400",
    muted: "text-gray-500",
    link: "text-teal-400 hover:underline",
    heading: "text-gray-100 font-bold",

    button: "bg-teal-500 text-black hover:bg-teal-400",
    buttonSecondary:
      "bg-transparent border border-teal-500 text-teal-400 hover:bg-teal-900/30",

    input:
      "bg-[#121212] border border-gray-700 text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-teal-400 focus:outline-none",

    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
  },

  classroom: {
    background: "linear-gradient(to bottom right, #2b2b2b, #1a1a1a)",
    textColor: "#e6f0d8",
    accent: "#bada55",
    font: "'Caveat', cursive",

    page: "bg-[#faf9f6]",
    surface: "bg-[#fefefe]",
    card: "bg-white shadow-md border border-[#e5e7eb]",

    text: "text-[#2c2c2c]",
    textSecondary: "text-[#4b5563]",
    muted: "text-[#6b7280]",
    link: "text-[#2563eb] hover:underline",
    heading: "text-[#1f2937] font-bold",

    button: "bg-[#2563eb] text-white hover:bg-[#1d4ed8]",
    buttonSecondary:
      "bg-transparent border border-[#2563eb] text-[#2563eb] hover:bg-[#dbeafe]",

    input:
      "bg-white border border-[#d1d5db] text-[#111827] placeholder-gray-400 focus:ring-2 focus:ring-[#2563eb] focus:outline-none",

    success: "text-green-600",
    error: "text-red-600",
    warning: "text-yellow-600",
  },

  leetcode: {
    background: "#1A1A1A",
    textColor: "#F5F5F5",
    accent: "#FFA116",
    font: "'Fira Code', monospace",

    page: "bg-[#1a1a1a]",
    surface: "bg-[#242424]",
    card: "bg-[#2a2a2a] border border-gray-700",

    text: "text-[#f5f5f5]",
    textSecondary: "text-gray-400",
    muted: "text-gray-500",
    link: "text-[#f59e0b] hover:underline",
    heading: "text-white font-bold",

    button: "bg-[#f59e0b] text-black hover:bg-[#eab308]",
    buttonSecondary:
      "bg-transparent border border-[#f59e0b] text-[#f59e0b] hover:bg-[#f59e0b33]",

    input:
      "bg-[#2a2a2a] border border-[#3a3a3a] text-[#f5f5f5] placeholder-gray-500 focus:ring-2 focus:ring-[#f59e0b] focus:outline-none",

    success: "text-green-400",
    error: "text-red-400",
    warning: "text-yellow-400",
  },
};
