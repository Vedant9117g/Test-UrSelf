// import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./ThemeProvider";

const Sidebar = () => {
  const { theme, themeStyles } = useTheme();
  const colors = themeStyles[theme].colors;
  const location = useLocation();

  const links = [
    { name: "Home", path: "/" },
    { name: "Profile", path: "/profile" },
    { name: "Settings", path: "/settings" },
  ];

  return (
    <aside
      className="h-full flex flex-col p-4"
      style={{
        backgroundColor: colors.secondary,
        color: colors.text,
        borderRight: `1px solid ${colors.tertiary}`,
      }}
    >
      {links.map((link) => {
        const active = location.pathname === link.path;
        return (
          <Link
            key={link.path}
            to={link.path}
            className="px-4 py-2 mb-2 rounded-md transition-colors"
            style={{
              backgroundColor: active ? colors.tertiary : "transparent",
              color: active ? colors.text : colors.textSecondary,
            }}
          >
            {link.name}
          </Link>
        );
      })}
    </aside>
  );
};

export default Sidebar;
