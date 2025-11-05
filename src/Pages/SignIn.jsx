import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../Components/Shared/Logo";

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Sign In Submitted:", formData);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
      
      {/* Logo */}
      <div className="mb-6">
        <Logo className="w-32 h-auto" />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Enter to Your Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="flex items-center bg-white border border-teal-300 rounded-md p-2 focus-within:border-teal-500">
            <Mail className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center bg-white border border-teal-300 rounded-md p-2 focus-within:border-teal-500 relative">
            <Lock className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm pr-10"
              required
            />
            <button
              type="button"
              className="absolute right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <a
              href="#"
              className="text-sm text-teal-500 hover:text-teal-600 transition"
            >
              Forgot password?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full bg-teal-400 text-white font-medium py-2.5 rounded-md hover:bg-teal-500 transition"
          >
            Sign In
          </button>
        </form>

        {/* Create Account Link */}
        <div className="mt-4 text-center text-sm text-gray-700">
          I have no account.{" "}
          <Link
            to="/signup"
            className="text-teal-500 font-medium hover:text-teal-600 transition"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
