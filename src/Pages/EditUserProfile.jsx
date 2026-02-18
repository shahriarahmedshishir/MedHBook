import { useState, useContext, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import AuthContext from "../Components/Context/AuthContext";
import axios from "axios";

const EditUserProfile = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobileNo: "",
    uid: "",
    img: "",
    hasAllergy: false,
    allergyDetails: "",
    diabeticLevel: "",
    bloodGroup: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const response = await axios.get(
            `http://localhost:3000/user/${user.email}`,
          );
          const userData = response.data;

          setFormData({
            name: userData.name || "",
            email: userData.email || "",
            mobileNo: userData.mobileNo || "",
            uid: userData.uid || "",
            img: userData.img || "",
            hasAllergy: userData.hasAllergy || false,
            allergyDetails: userData.allergyDetails || "",
            diabeticLevel: userData.diabeticLevel || "",
            bloodGroup: userData.bloodGroup || "",
          });

          if (userData.img) {
            const serverURL =
              import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
            setImagePreview(
              userData.img.startsWith("http")
                ? userData.img
                : `${serverURL}${userData.img}`,
            );
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear allergy details if no allergy
    if (name === "hasAllergy" && !checked) {
      setFormData((prev) => ({ ...prev, allergyDetails: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "loading", message: "Updating profile..." });

    try {
      let imageUrl = formData.img;

      // Upload image if new one selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);

        const imageResponse = await axios.post(
          "http://localhost:3000/upload-user-image",
          imageFormData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        imageUrl = imageResponse.data.imagePath;
      }

      // Update user profile
      const updateData = {
        name: formData.name,
        email: formData.email,
        mobileNo: formData.mobileNo,
        uid: formData.uid,
        img: imageUrl,
        hasAllergy: formData.hasAllergy,
        allergyDetails: formData.allergyDetails,
        diabeticLevel: formData.diabeticLevel,
        bloodGroup: formData.bloodGroup,
      };

      await axios.put(`http://localhost:3000/user/${user.email}`, updateData);

      // Refresh user data in context to update the image everywhere
      if (refreshUser) {
        await refreshUser();
      }

      // Force a small delay to ensure database is updated
      setTimeout(() => {
        if (refreshUser) refreshUser();
      }, 500);

      setStatus({
        type: "success",
        message: "Profile updated successfully!",
      });
      setTimeout(() => setStatus({ type: "", message: "" }), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setStatus({
        type: "error",
        message: error.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            Edit Your Profile
          </h1>

          {status.message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                status.type === "success"
                  ? "bg-green-100 text-green-800"
                  : status.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-indigo-600 rounded-full p-2 cursor-pointer hover:bg-indigo-700 transition">
                  <ImageIcon className="w-5 h-5 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline w-4 h-4 mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline w-4 h-4 mr-2" />
                  Mobile Number
                </label>
                <input
                  type="tel"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  placeholder="Enter mobile number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            {/* Medical Information */}
            <div className="border-t pt-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
                Medical Information
              </h2>

              {/* Allergy Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="hasAllergy"
                    checked={formData.hasAllergy}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label className="ml-3 text-sm font-medium text-gray-700">
                    Do you have any allergies?
                  </label>
                </div>

                {formData.hasAllergy && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allergy Details
                    </label>
                    <textarea
                      name="allergyDetails"
                      value={formData.allergyDetails}
                      onChange={handleChange}
                      placeholder="Please specify your allergies (e.g., peanuts, penicillin, dust)"
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Diabetic Level */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diabetic Level (HbA1c %)
                </label>
                <input
                  type="number"
                  name="diabeticLevel"
                  value={formData.diabeticLevel}
                  onChange={handleChange}
                  placeholder="e.g., 5.6, 6.5, 7.2"
                  step="0.1"
                  min="0"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Normal: below 5.7% | Pre-diabetic: 5.7-6.4% | Diabetic: 6.5%
                  or higher
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-300"
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
