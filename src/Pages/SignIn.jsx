import React, { useState, useContext, useEffect, useRef } from "react";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Components/Shared/Logo";
import AuthContext from "../Components/Context/AuthContext";
import {
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import auth from "../Components/Firebase/firebase.init";

const SignIn = () => {
  const {
    signInUser,
    resetPassword,
    sendVerificationEmail,
    signInWithGoogle,
    isAdmin,
    user,
    loading: authLoading,
  } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

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
    setVerificationError(false);
    setLocalLoading(true);

    try {
      await signInUser(formData.email, formData.password);
    } catch (err) {
      console.error("Sign-in failed:", err);
      let message = "Something went wrong. Please try again.";

      // Check if it's an email verification error
      if (err.message && err.message.includes("verify your email")) {
        setVerificationError(true);
        setError(err.message);
      } else {
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
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLocalLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error("Google sign-in failed:", err);
      let message = "Google sign-in failed. Please try again.";

      if (err.code === "auth/popup-blocked") {
        message = "Pop-up blocked. Please allow pop-ups and try again.";
      } else if (err.code === "auth/popup-closed-by-user") {
        message = "Sign-in cancelled.";
      }

      setError(message);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setResendSuccess(false);
    try {
      // Temporarily sign in to resend verification
      const cred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      await sendEmailVerification(cred.user);
      await signOut(auth);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to resend verification:", err);
      setError(
        "Failed to resend verification email. Please check your credentials and try again.",
      );
    }
  };

  // Redirect after successful login
  useEffect(() => {
    if (!authLoading && user) {
      // Check user role and redirect accordingly
      if (user.role === "admin" || isAdmin) {
        navigate("/admin", { replace: true });
      } else if (user.role === "doctor") {
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
            <div className="bg-red-50 p-4 rounded-lg border border-red-200 animate-fadeIn">
              <div className="flex items-start gap-2">
                <AlertCircle className="text-red-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-red-600 text-sm flex-1">{error}</p>
              </div>
              {verificationError && (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="mt-3 w-full bg-[#67cffe] text-white text-sm font-semibold py-2 rounded-lg hover:bg-[#304d5d] transition-colors duration-300"
                >
                  Resend Verification Email
                </button>
              )}
            </div>
          )}
          {resendSuccess && (
            <p className="text-green-600 text-center text-sm bg-green-50 p-3 rounded-lg border border-green-200 animate-fadeIn">
              ✅ Verification email sent! Check your inbox.
            </p>
          )}
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-[1px] bg-gray-300"></div>
          <span className="text-xs text-gray-500 font-medium">OR</span>
          <div className="flex-1 h-[1px] bg-gray-300"></div>
        </div>

        {/* Google Sign-In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={localLoading}
          className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-[#67cffe] rounded-lg p-3 transition-all duration-300 hover:shadow-lg hover:shadow-[#67cffe]/20 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            {localLoading ? "Signing in..." : "Sign in with Google"}
          </span>
        </button>

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
