import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user); // Get user from Redux store

  return (
    <nav className="sticky top-0 bg-gray-200 dark:bg-gray-800 p-4 flex justify-between items-center shadow-md z-50">
      <Link to="/" className="text-xl font-semibold text-gray-900 dark:text-white">
        My-App
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-gray-900 dark:text-white">Welcome, {user.name}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/signup" className="text-gray-900 dark:text-white hover:underline">
              Signup
            </Link>
            <Link to="/login" className="text-gray-900 dark:text-white hover:underline">
              Login
            </Link>
          </>
        )}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;