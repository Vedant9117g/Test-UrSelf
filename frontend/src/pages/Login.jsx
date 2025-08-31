import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useLoginUserMutation } from "../features/api/authApi";
import { useTheme } from "../components/ThemeProvider";
import { FiMail, FiLock } from "react-icons/fi";

const Login = () => {
  const navigate = useNavigate();
  const { styles } = useTheme();

  const [loginInput, setLoginInput] = useState({ email: "", password: "" });

  const [
    loginUser,
    { data: loginData, error: loginError, isLoading: loginIsLoading, isSuccess: loginIsSuccess },
  ] = useLoginUserMutation();

  const changeInputHandler = (e) => {
    const { name, value } = e.target;
    setLoginInput({ ...loginInput, [name]: value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(loginInput).unwrap();
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  useEffect(() => {
    if (loginIsSuccess && loginData) {
      localStorage.setItem("authToken", loginData.token);
      localStorage.setItem("userRole", loginData.user.role);
      toast.success(loginData.message || "Login successful.");
      
        navigate("/");
      
    }
    if (loginError) {
      toast.error(loginError.data?.message || "Login failed. Please try again.");
    }
  }, [loginIsSuccess, loginData, loginError, navigate]);

  return (
    <div
      className="flex items-center justify-center min-h-screen transition-colors duration-300 relative overflow-hidden"
      style={{
        background: styles.colors.background,
        color: styles.colors.text,
        fontFamily: styles.font,
      }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative w-full max-w-md h-auto overflow-hidden rounded-2xl shadow-2xl border p-8 z-10"
        style={{
          background: styles.colors.primary,
          borderColor: styles.colors.secondary,
          WebkitBackdropFilter: "blur(18px)",
          backdropFilter: "blur(18px)",
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-extrabold text-center mb-2"
          style={{ color: styles.colors.heading }}
        >
          Welcome Back
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-center mb-6"
          style={{ color: styles.colors.textSecondary }}
        >
          Sign in to continue your journey!
        </motion.p>

        <form onSubmit={handleLogin} className="space-y-4">
          {["email", "password"].map((field, idx) => {
            const Icon = field === "email" ? FiMail : FiLock;
            return (
              <motion.div
                key={field}
                className="relative"
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + idx * 0.03 }}
              >
                <label
                  htmlFor={field}
                  className="block text-sm font-medium mb-1"
                  style={{ color: styles.colors.text }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>

                <div className="relative">
                  <Icon
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    style={{ color: styles.colors.textSecondary }}
                  />
                  <input
                    type={field === "password" ? "password" : "text"}
                    name={field}
                    id={field}
                    value={loginInput[field]}
                    onChange={changeInputHandler}
                    placeholder={`Enter your ${field}`}
                    className="w-full pl-10 py-2 rounded-lg border focus:outline-none transition"
                    style={{
                      background: styles.colors.secondary,
                      borderColor: styles.colors.tertiary,
                      color: styles.colors.text,
                    }}
                    required
                  />
                </div>
              </motion.div>
            );
          })}

          <motion.button
            type="submit"
            disabled={loginIsLoading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2 font-semibold rounded-lg shadow-lg flex items-center justify-center transition-all"
            style={{
              background: styles.accent,
              color: styles.colors.text,
            }}
          >
            {loginIsLoading ? "Signing In..." : "Login"}
          </motion.button>
        </form>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center mt-4"
          style={{ color: styles.colors.textSecondary }}
        >
          Don&apos;t have an account?{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => navigate("/signup")}
            style={{ color: styles.accent }}
          >
            Sign up
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
