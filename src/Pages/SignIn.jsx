import React, { useState, useContext, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Components/Shared/Logo";
import AuthContext from "../Components/Context/AuthContext";

const SignIn = () => {
  const {
    signInUser,
    resetPassword,
    isAdmin,
    user,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const forgotRef = useRef(null);

  // Handle click outside for forgot password
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (forgotRef.current && !forgotRef.current.contains(e.target)) {
        setForgotOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent back button after logout
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const preventBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.addEventListener("popstate", preventBack);
    return () => window.removeEventListener("popstate", preventBack);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);
    setLocalLoading(true);

    try {
      await signInUser(formData.email, formData.password);
    } catch (err) {
      console.error("Sign-in failed:", err);
      let message = "Something went wrong. Please try again.";
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          message = "Wrong email or password!";
          break;
        case "auth/invalid-email":
          message = "Please enter a valid email address!";
          break;
        case "auth/too-many-requests":
          message = "Too many attempts. Please try again later.";
          break;
        default:
          message = err.message || message;
      }
      setError(message);
    } finally {
      setLocalLoading(false);
    }
  };

  // Redirect after successful login
  useEffect(() => {
    if (!authLoading && user) {
      // Check if user has doctor role
      if (user.role === "doctor" || user.role === "admin" || isAdmin) {
        navigate("/doctor", { replace: true });
      } else {
        navigate("/patient", { replace: true });
      }
    }
  }, [user, isAdmin, navigate, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
      <Logo className="w-32 h-auto mb-6" />

      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Enter to Your Account
        </h2>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="flex items-center border border-teal-300 rounded-md p-2 focus-within:border-teal-500">
            <Mail className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm"
              required
              disabled={localLoading}
            />
          </div>

          <div className="flex items-center border border-teal-300 rounded-md p-2 focus-within:border-teal-500 relative">
            <Lock className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm pr-10"
              required
              disabled={localLoading}
            />
            <button
              type="button"
              className="absolute right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
              disabled={localLoading}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-teal-400 text-white font-medium py-2.5 rounded-md hover:bg-teal-500 transition disabled:bg-teal-300"
            disabled={localLoading}
          >
            {localLoading ? "Signing in..." : "Sign In"}
          </button>

          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}
        </form>

        <div className="mt-4 text-center text-sm text-gray-700">
          I have no account.{" "}
          <Link
            to="/signup"
            className="text-teal-500 font-medium hover:text-teal-600 transition"
          >
            Create account
          </Link>
        </div>

        {/* Forgot Password */}
        <div className="mt-4 text-center relative">
          <p
            className="text-sm text-teal-500 hover:text-teal-600 cursor-pointer"
            onClick={() => setForgotOpen((prev) => !prev)}
          >
            Forgot password?
          </p>

          {forgotOpen && (
            <div
              ref={forgotRef}
              className="absolute top-6 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white shadow-lg rounded-md p-4 mt-2 z-50"
            >
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await resetPassword(forgotEmail.trim());
                  setForgotEmail("");
                  setForgotOpen(false);
                }}
                className="flex gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="flex-1 border border-teal-300 rounded-md px-3 py-2"
                  required
                />
                <button
                  type="submit"
                  className="bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-600 transition"
                >
                  Reset
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignIn;
