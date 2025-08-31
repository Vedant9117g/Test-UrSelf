import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "./ThemeProvider";
import { Sun, Moon, BookOpen, Code } from "lucide-react";

const themeIcons = {
  light: <Sun className="h-5 w-5 text-yellow-500" />,
  dark: <Moon className="h-5 w-5 text-blue-400" />,
  classroom: <BookOpen className="h-5 w-5 text-green-400" />,
  coder: <Code className="h-5 w-5 text-orange-400" />,
};

const Navbar = () => {
  const { theme, setTheme, themeStyles } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
    navigate("/login");
  };

  const colors = themeStyles[theme].colors;

  return (
    <nav
      className="sticky top-0 p-4 flex justify-between items-center shadow-md z-50"
      style={{
        background: colors.primary,
        color: colors.text,
      }}
    >
      <Link to="/" className="text-xl font-bold">
        My-App
      </Link>

      <div className="flex items-center gap-4 relative">
        {user ? (
          <>
            <span>{user.name}</span>
            <button
              onClick={handleLogout}
              className={`px-4 py-2 rounded-md transition-colors duration-200`}
              style={{
                backgroundColor: colors.accent,
                color: colors.text,
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="hover:underline">
              Signup
            </Link>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          </>
        )}

        {/* Theme Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full border transition-colors"
            style={{
              borderColor: colors.textSecondary,
              background: colors.secondary,
              color: colors.text,
            }}
          >
            {themeIcons[theme]}
          </button>

          {open && (
            <div
              className="absolute right-0 mt-2 w-40 rounded-md shadow-lg overflow-hidden"
              style={{
                background: colors.primary,
                border: `1px solid ${colors.tertiary}`,
              }}
            >
              {Object.keys(themeStyles).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTheme(t);
                    setOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-left hover:opacity-80 transition-colors"
                  style={{
                    color: themeStyles[t].colors.text,
                  }}
                >
                  {themeIcons[t]}
                  <span className="ml-2 capitalize">{t}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
