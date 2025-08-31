import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutUserMutation } from "../features/api/authApi";
import { userLoggedOut } from "../features/authSlice";
import { useTheme } from "../components/ThemeProvider";
import { Sun, Moon, BookOpen, Code, Menu, X, Bell, User, LogOut } from "lucide-react";

const themeIcons = {
  light: <Sun className="h-5 w-5 text-yellow-500" />,
  dark: <Moon className="h-5 w-5 text-blue-400" />,
  classroom: <BookOpen className="h-5 w-5 text-green-400" />,
  coder: <Code className="h-5 w-5 text-orange-400" />,
};

const hardcodedNotifications = [
  { message: "New mock test available: Physics", read: false },
  { message: "Your streak has reached 5 days!", read: true },
  { message: "Discussion reply from Alice", read: false },
  { message: "New exam added: GATE 2026", read: true },
];

const Navbar = () => {
  const { theme, setTheme, themeStyles } = useTheme();
  const colors = themeStyles[theme].colors;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [openTheme, setOpenTheme] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);

  const [logoutUser] = useLogoutUserMutation();

  const profileRef = useRef(null);
  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const navLinks = [
    { name: "Exams", path: "/exams" },
    { name: "Mock Tests", path: "/mock-tests" },
    { name: "Discussions", path: "/discussions" },
    { name: "Leaderboard", path: "/leaderboard" },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser().unwrap();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch(userLoggedOut());
      localStorage.removeItem("authToken");
      navigate("/login");
    }
  };

  const unreadCount = hardcodedNotifications.filter((n) => !n.read).length;

  const renderHoverStyle = (bg = colors.primary) => ({
    onMouseEnter: (e) => (e.currentTarget.style.backgroundColor = colors.hover),
    onMouseLeave: (e) => (e.currentTarget.style.backgroundColor = bg),
  });

  // Close dropdowns/menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setOpenProfile(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setOpenNotifications(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setOpenTheme(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full shadow-md"
      style={{ background: colors.primary, color: colors.text }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold" style={{ color: colors.text }}>
          My-App
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="px-3 py-1 rounded transition-colors"
              style={{ color: colors.text }}
              {...renderHoverStyle()}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setOpenNotifications(!openNotifications)}
                  className="p-2 rounded-full border transition-colors relative"
                  style={{
                    borderColor: colors.textSecondary,
                    background: colors.secondary,
                    color: colors.text,
                  }}
                >
                  <Bell />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 rounded-full w-3 h-3 bg-red-500"></span>
                  )}
                </button>
                {openNotifications && (
                  <div
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto border transition-all"
                    style={{
                      background: colors.primary,
                      borderColor: colors.tertiary,
                      zIndex: 50,
                      transform: "translateY(10px)",
                    }}
                  >
                    {hardcodedNotifications.map((n, idx) => (
                      <div
                        key={idx}
                        className={`px-4 py-2 text-sm cursor-pointer rounded-lg transition-colors ${
                          !n.read ? "font-semibold" : "font-normal"
                        }`}
                        style={{ backgroundColor: colors.primary, color: colors.text }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = colors.hover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = colors.primary)
                        }
                      >
                        {n.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setOpenProfile(!openProfile)}
                  className="p-2 rounded-full border transition-colors"
                  style={{
                    borderColor: colors.textSecondary,
                    background: colors.secondary,
                    color: colors.text,
                  }}
                >
                  <User />
                </button>
                {openProfile && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl shadow-2xl overflow-hidden border transition-all"
                    style={{
                      background: colors.primary,
                      borderColor: colors.tertiary,
                      zIndex: 50,
                      transform: "translateY(10px)",
                    }}
                  >
                    {[
                      { name: "Profile", path: "/profile" },
                      { name: "My Progress", path: "/my-progress" },
                      { name: "Settings", path: "/settings" },
                      !user.isPremium && { name: "Upgrade to Premium", path: "/premium" },
                    ]
                      .filter(Boolean)
                      .map((link, idx) => (
                        <Link
                          key={idx}
                          to={link.path}
                          className="block px-4 py-2 text-sm rounded-lg transition-colors"
                          style={{ backgroundColor: colors.primary, color: colors.text }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = colors.hover)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = colors.primary)
                          }
                        >
                          {link.name}
                        </Link>
                      ))}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors"
                      style={{ backgroundColor: colors.primary, color: colors.text }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = colors.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = colors.primary)
                      }
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Dropdown */}
              <div className="relative" ref={themeRef}>
                <button
                  onClick={() => setOpenTheme(!openTheme)}
                  className="p-2 rounded-full border transition-colors"
                  style={{
                    borderColor: colors.textSecondary,
                    background: colors.secondary,
                    color: colors.text,
                  }}
                >
                  {themeIcons[theme]}
                </button>
                {openTheme && (
                  <div
                    className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl overflow-hidden border transition-all"
                    style={{
                      background: colors.primary,
                      borderColor: colors.tertiary,
                      zIndex: 50,
                      transform: "translateY(10px)",
                    }}
                  >
                    {Object.keys(themeIcons).map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTheme(t);
                          setOpenTheme(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-left cursor-pointer rounded-lg transition-colors"
                        style={{
                          backgroundColor: colors.primary,
                          color: themeStyles[t].colors.text,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = themeStyles[t].colors.hover)
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = colors.primary)
                        }
                      >
                        {themeIcons[t]}
                        <span className="ml-2 capitalize">{t}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/signup" className="px-3 py-1 rounded hover:underline" style={{ color: colors.text }}>
                Signup
              </Link>
              <Link to="/login" className="px-3 py-1 rounded hover:underline" style={{ color: colors.text }}>
                Login
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2" ref={mobileMenuRef}>
          <button
            onClick={() => setMobileMenu(!mobileMenu)}
            className="p-2 rounded-md border"
            style={{
              borderColor: colors.textSecondary,
              background: colors.secondary,
              color: colors.text,
            }}
          >
            {mobileMenu ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Links */}
      {mobileMenu && (
        <div
          className="md:hidden flex flex-col px-4 pb-4 gap-3"
          style={{ background: colors.primary }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="px-2 py-1 rounded transition-colors"
              style={{ color: colors.text }}
              {...renderHoverStyle()}
              onClick={() => setMobileMenu(false)}
            >
              {link.name}
            </Link>
          ))}

          {user ? (
            <>
              <span style={{ color: colors.text }}>{user.name}</span>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenu(false);
                }}
                className="px-4 py-2 rounded-md transition-colors"
                style={{ backgroundColor: colors.accent, color: colors.text }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="hover:underline"
                style={{ color: colors.text }}
                onClick={() => setMobileMenu(false)}
              >
                Signup
              </Link>
              <Link
                to="/login"
                className="hover:underline"
                style={{ color: colors.text }}
                onClick={() => setMobileMenu(false)}
              >
                Login
              </Link>
            </>
          )}

          <div className="flex gap-2 mt-2">
            {Object.keys(themeIcons).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="p-2 rounded-full"
                style={{
                  background: themeStyles[t].colors.secondary,
                  color: themeStyles[t].colors.text,
                }}
              >
                {themeIcons[t]}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
