import { useState } from "react";
import { useNavigate} from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useRegisterUserMutation } from "../features/api/authApi";
import { useTheme } from "../components/ThemeProvider";
import { FiUser, FiMail, FiLock, FiPhone } from "react-icons/fi";

const Signup = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterUserMutation();
  const { styles } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "student",
    examType: "JEE",
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role.toLowerCase(),
      examType: formData.examType.toUpperCase(),
    };

    try {
      const result = await registerUser(userData).unwrap();
      toast.success(result.message || "Signup successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.data?.message || "Signup failed. Please try again.");
    }
  };

  const iconMap = {
    name: FiUser,
    email: FiMail,
    password: FiLock,
    phone: FiPhone,
  };

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
          Create Account
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-center mb-6"
          style={{ color: styles.colors.textSecondary }}
        >
          Join MyTrip and start your journey!
        </motion.p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {["name", "email", "password", "phone"].map((field, idx) => {
            const Icon = iconMap[field];
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
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: styles.colors.textSecondary }}
                  />
                  <input
                    type={field === "password" ? "password" : "text"}
                    name={field}
                    id={field}
                    value={formData[field]}
                    onChange={handleChange}
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

          {/* Role */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.47 }}
          >
            <label
              htmlFor="role"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.colors.text }}
            >
              Role
            </label>
            <select
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
              required
              style={{
                background: styles.colors.secondary,
                borderColor: styles.colors.tertiary,
                color: styles.colors.text,
              }}
            >
              <option value="student">Student</option>
              <option value="admin">Admin</option>
              <option value="mentor">Mentor</option>
            </select>
          </motion.div>

          {/* Exam Type */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label
              htmlFor="examType"
              className="block text-sm font-medium mb-1"
              style={{ color: styles.colors.text }}
            >
              Exam Type
            </label>
            <select
              name="examType"
              id="examType"
              value={formData.examType}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border focus:outline-none transition"
              required
              style={{
                background: styles.colors.secondary,
                borderColor: styles.colors.tertiary,
                color: styles.colors.text,
              }}
            >
              <option value="JEE">JEE</option>
              <option value="GATE">GATE</option>
            </select>
          </motion.div>

          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="w-full py-2 font-semibold rounded-lg shadow-lg flex items-center justify-center transition-all"
            style={{
              background: styles.accent,
              color: styles.colors.text,
            }}
          >
            {isLoading ? "Signing Up..." : "Sign Up"}
          </motion.button>
        </form>

        {/* Login Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center mt-4"
          style={{ color: styles.colors.textSecondary }}
        >
          Already have an account?{" "}
          <span
            className="underline cursor-pointer"
            onClick={() => navigate("/login")}
            style={{ color: styles.accent }}
          >
             Login
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Signup;
