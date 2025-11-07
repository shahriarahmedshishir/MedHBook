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
      // ✅ 1. Create user in Firebase Authentication
      await createUser(email, password);

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
      setTimeout(() => navigate("/signin"), 2000);
    } catch (err) {
      console.error("❌ Registration failed:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
      {/* Logo */}
      <div className="mb-6">
        <Logo className="w-32 h-auto" />
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Create Your Account
        </h2>

        {/* Profile Image Upload */}
        <div className="flex flex-col items-center mb-6">
          <label
            htmlFor="image"
            className="cursor-pointer flex flex-col items-center justify-center w-28 h-28 bg-[#b2ebf2] rounded-full border-2 border-dashed border-teal-400 hover:border-teal-500 transition relative"
          >
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-28 h-28 rounded-full object-cover"
              />
            ) : (
              <Upload className="text-teal-400 w-5 h-5 mr-2" />
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
          <p className="text-xs text-gray-500 mt-2">Upload Profile Image</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div className="flex items-center border border-teal-300 rounded-md p-2">
            <User className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm"
              required
            />
          </div>

          {/* Mobile */}
          <div className="flex items-center border border-teal-300 rounded-md p-2">
            <Phone className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type="tel"
              name="mobile"
              placeholder="Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm"
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-teal-300 rounded-md p-2">
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
          <div className="flex items-center border border-teal-300 rounded-md p-2 relative">
            <Lock className="text-teal-400 w-5 h-5 mr-2" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-transparent outline-none text-gray-800 text-sm pr-8"
              required
            />
            <button
              type="button"
              className="absolute right-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-teal-400 text-white font-medium py-2.5 rounded-md hover:bg-teal-500 transition"
            disabled={loading}
          >
            {loading ? "Processing..." : "Sign Up"}
          </button>

          {/* Feedback Messages */}
          {error && (
            <p className="text-red-500 text-center text-sm mt-2">{error}</p>
          )}
          {success && (
            <p className="text-green-500 text-center text-sm mt-2">
              Registration successful! Redirecting...
            </p>
          )}
        </form>

        {/* Redirect Link */}
        <div className="mt-4 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-teal-500 font-medium hover:text-teal-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
