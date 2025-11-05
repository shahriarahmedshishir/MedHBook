import { useState } from "react";
import { User, Mail, Lock, Phone, Upload, Eye, EyeOff } from "lucide-react";
import Logo from "../Components/Shared/Logo";
import { Link } from "react-router";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", formData);
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
              <Upload className="text-teal-500" size={28} />
            )}
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Upload Profile Image</p>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center bg-white border border-teal-300 rounded-md p-2 focus-within:border-teal-500">
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

          <div className="flex items-center bg-white border border-teal-300 rounded-md p-2 focus-within:border-teal-500">
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

          {/* Password with toggle */}
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

          <button
            type="submit"
            className="w-full bg-teal-400 text-white font-medium py-2.5 rounded-md hover:bg-teal-500 transition"
          >
            Sign Up
          </button>
        </form>
        {/* Create Account Link */}
        <div className="mt-4 text-center text-sm text-gray-700">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="text-teal-500 font-medium hover:text-teal-600 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
