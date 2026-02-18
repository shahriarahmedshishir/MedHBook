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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-10 right-10 w-72 h-72 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="animate-bounceIn mb-6">
        <Logo className="w-32 h-auto" />
      </div>

      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md relative animate-scaleIn border border-white/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#304d5d] via-[#67cffe] to-[#304d5d] rounded-t-2xl"></div>

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">
          Sign in to continue to your account
        </p>

        <form onSubmit={handleSignIn} className="space-y-5">
          <div className="flex items-center border-2 border-gray-200 rounded-lg p-3 focus-within:border-[#67cffe] focus-within:shadow-lg focus-within:shadow-[#67cffe]/20 transition-all duration-300 hover:border-[#67cffe]/50 bg-white">
            <Mail className="text-[#67cffe] w-5 h-5 mr-3" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
              required
              disabled={localLoading}
            />
          </div>

          <div className="flex items-center border-2 border-gray-200 rounded-lg p-3 focus-within:border-[#67cffe] focus-within:shadow-lg focus-within:shadow-[#67cffe]/20 transition-all duration-300 hover:border-[#67cffe]/50 bg-white relative">
            <Lock className="text-[#67cffe] w-5 h-5 mr-3" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm pr-10 placeholder-gray-400"
              required
              disabled={localLoading}
            />
            <button
              type="button"
              className="absolute right-3 text-gray-400 hover:text-[#67cffe] transition-colors duration-300"
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
            className="w-full bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white font-semibold py-3 rounded-lg hover:shadow-xl hover:shadow-[#67cffe]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={localLoading}
          >
            {localLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>

          {error && (
            <p className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg border border-red-200 animate-fadeIn">
              {error}
            </p>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-[#67cffe] font-semibold hover:text-[#304d5d] transition-colors duration-300 hover:underline"
          >
            Create account
          </Link>
        </div>

        {/* Forgot Password */}
        <div className="mt-4 text-center relative">
          <button
            type="button"
            className="text-sm text-[#304d5d] hover:text-[#67cffe] transition-colors duration-300 font-medium"
            onClick={() => setForgotOpen((prev) => !prev)}
          >
            Forgot password?
          </button>

          {forgotOpen && (
            <div
              ref={forgotRef}
              className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white/95 backdrop-blur-sm shadow-2xl rounded-lg p-5 mt-2 z-50 border border-[#67cffe]/20 animate-scaleIn"
            >
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Reset Password
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await resetPassword(forgotEmail.trim());
                  setForgotEmail("");
                  setForgotOpen(false);
                }}
                className="flex flex-col gap-3"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="flex-1 border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:border-[#67cffe] outline-none transition-all duration-300"
                  required
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white px-5 py-2.5 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
                >
                  Send Reset Link
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
