// SignUp.jsx
import React, { useContext, useState } from "react";
import { User, Mail, Lock, Phone, Upload, Eye, EyeOff } from "lucide-react";
import Logo from "../Components/Shared/Logo";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const SignUp = () => {
  const { createUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    image: null, // Will hold the File object, not the Base64 string
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Handle text inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload & preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result); // Set preview using Base64 result
    };
    reader.readAsDataURL(file);

    // Store the actual File object in formData
    setFormData((prev) => ({ ...prev, image: file }));
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, mobile, email, password } = formData; // Extract image separately
    const imageFile = formData.image; // The File object

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // ✅ 1. Create user in Firebase Authentication (verification email sent automatically)
      const userCredential = await createUser(email, password);

      console.log("✅ Firebase user created:", userCredential.user.email);
      console.log("📧 Verification email sent to:", email);

      setVerificationSent(true);

      // ✅ 2. Prepare form data for upload using FormData
      // This is necessary to send files correctly
      const userDataToSend = new FormData();
      userDataToSend.append("name", name);
      userDataToSend.append("email", email);
      userDataToSend.append("mobileNo", mobile);
      userDataToSend.append("role", "user");
      // Append the image file if one was selected
      if (imageFile) {
        userDataToSend.append("img", imageFile); // Send the File object
      }

      // ✅ 3. Send user data (including file) to backend
      const res = await fetch("http://localhost:3000/userdata", {
        method: "POST",
        body: userDataToSend,
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message || "Failed to save user");

      console.log("✅ Saved to MongoDB:", data);

      setSuccess(true);
      // Don't auto-redirect, let user see verification message
      // setTimeout(() => navigate("/signin"), 5000);
    } catch (err) {
      console.error("❌ Registration failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-4 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-10 right-10 w-72 h-72 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Logo */}
      <div className="mb-6 animate-bounceIn">
        <Logo className="w-32 h-auto" />
      </div>

      <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl p-6 sm:p-8 w-full max-w-md relative animate-scaleIn border border-white/20">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#304d5d] via-[#67cffe] to-[#304d5d] rounded-t-2xl"></div>

        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-600 mb-6 text-sm">
          Join us today and get started
        </p>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <label
            htmlFor="image"
            className="cursor-pointer flex flex-col items-center justify-center w-28 h-28 bg-gradient-to-br from-[#67cffe]/20 to-[#304d5d]/10 rounded-full border-2 border-dashed border-[#67cffe] hover:border-[#304d5d] hover:shadow-lg hover:shadow-[#67cffe]/20 transition-all duration-300 relative group"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <Upload className="text-[#67cffe] w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            )}
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              disabled={loading}
            />
          </label>
          <p className="text-xs text-gray-600 mt-2 font-medium">
            Upload Profile Image
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-5">
          {/* Name */}
          <div className="flex items-center border-2 border-gray-200 rounded-lg p-3 focus-within:border-[#67cffe] focus-within:shadow-lg focus-within:shadow-[#67cffe]/20 transition-all duration-300 hover:border-[#67cffe]/50 bg-white">
            <User className="text-[#67cffe] w-5 h-5 mr-3" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex items-center border-2 border-gray-200 rounded-lg p-3 focus-within:border-[#67cffe] focus-within:shadow-lg focus-within:shadow-[#67cffe]/20 transition-all duration-300 hover:border-[#67cffe]/50 bg-white">
            <Phone className="text-[#67cffe] w-5 h-5 mr-3" />
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm placeholder-gray-400"
              required
            />
          </div>

          {/* Email */}
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
            />
          </div>

          {/* Password */}
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
            />
            <button
              type="button"
              className="absolute right-3 text-gray-400 hover:text-[#67cffe] transition-colors duration-300"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white font-semibold py-3 rounded-lg hover:shadow-xl hover:shadow-[#67cffe]/30 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </span>
            ) : (
              "Sign Up"
            )}
          </button>

          {/* Feedback Messages */}
          {error && (
            <p className="text-red-600 text-center text-sm bg-red-50 p-3 rounded-lg border border-red-200 animate-fadeIn">
              {error}
            </p>
          )}
          {success && verificationSent && (
            <div className="text-green-600 text-center text-sm bg-green-50 p-4 rounded-lg border border-green-200 animate-fadeIn space-y-2">
              <p className="font-semibold">✅ Account created successfully!</p>
              <p className="text-xs">
                📧 A verification email has been sent to{" "}
                <strong>{formData.email}</strong>
              </p>
              <p className="text-xs">
                Please verify your email before signing in.
              </p>
              <div className="text-xs text-gray-600 mt-2 space-y-1">
                <p>📌 Check your spam/junk folder if you don't see it</p>
                <p>⏱️ Email may take a few minutes to arrive</p>
                <p>📬 Look for an email from Firebase</p>
              </div>
              <Link
                to="/signin"
                className="inline-block mt-3 px-4 py-2 bg-[#67cffe] text-white rounded-lg hover:bg-[#304d5d] transition-colors duration-300 font-medium"
              >
                Go to Sign In
              </Link>
            </div>
          )}
        </form>

        {/* Redirect Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-[#67cffe] font-semibold hover:text-[#304d5d] transition-colors duration-300 hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
