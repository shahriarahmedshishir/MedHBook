import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Search, Edit3, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

// Smart helper to get full image URL
const getFullImageURL = (imgPath) => {
  if (!imgPath) return "https://i.pravatar.cc/100"; // fallback placeholder
  if (imgPath.startsWith("http")) return imgPath; // already full URL
  return `${
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
  }${imgPath}`;
};

const DoctorHome = () => {
  const { user } = useContext(AuthContext); // logged-in doctor
  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Search patient by UID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return alert("Enter a User ID");

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/user?role=patient`
      );
      if (!res.ok) throw new Error("Failed to fetch users");

      const users = await res.json();
      const patient = users.find((u) => u.uid === parseInt(searchId));

      if (!patient) {
        setSearchedUser(null);
        alert("Patient not found");
      } else {
        setSearchedUser(patient);
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching user: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to patient details page
  const handleSeeDetails = (user) => {
    navigate("/patient-details", {
      state: {
        uid: user.uid,
        email: user.email,
        name: user.name,
        img: user.img,
      },
    });
  };
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(`http://localhost:3000/doctor/${user.email}`)
      .then((res) => setDoctor(res.data))
      .catch((err) => {
        if (err.response?.status !== 404) console.error(err);
        setDoctor(null); // no profile yet
      });
  }, [user]);
  const handleEditProfile = () => {
    navigate("/edit-doctor-profile"); // Update the route to match your edit profile page
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <div className="flex flex-col items-center justify-center px-4 h-[calc(35vh)]">
          <h1
            className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent 
               bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300
               overflow-hidden border-r-4
               whitespace-nowrap md:whitespace-normal
               mx-auto text-center
               max-w-[90vw] md:max-w-3xl"
          >
            MedHBook — a smart digital system to store, access, and share
            medical records securely in one place.
          </h1>

          <p className="mt-4 text-base md:text-lg font-semibold tracking-wide text-black/90 text-center typewriter">
            Your Health. Your Records. One Book.
          </p>
        </div>
        {/* Doctor Card */}
        {user && (
          <div className="flex justify-center mt-6 md:mt-10 px-4">
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-4 md:p-6 flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full max-w-3xl">
              {/* Profile Image */}
              <img
                src={getFullImageURL(user.img)}
                alt={user.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-teal-300"
              />

              {/* Info Section */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                  {doctor?.name || user.name}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {doctor?.email || user.email}
                </p>
                {doctor?.specialization && (
                  <p className="text-gray-400 text-sm mt-1">
                    {doctor.specialization}
                  </p>
                )}
                {doctor?.phone && (
                  <p className="text-gray-400 text-sm mt-1">
                    Phone: {doctor.phone}
                  </p>
                )}
                {doctor?.yearsOfExperience && (
                  <p className="text-gray-400 text-sm mt-1">
                    Experience: {doctor.yearsOfExperience} yrs
                  </p>
                )}
              </div>

              {/* Edit Info and Create Blog Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full md:w-auto">
                <button
                  onClick={handleEditProfile}
                  className="w-full sm:w-auto px-4 md:px-5 py-2 bg-gradient-to-r from-teal-400 to-teal-600 text-white font-medium rounded-full shadow-lg hover:scale-105 transform transition duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Info
                </button>
                <button
                  onClick={() => navigate("/create-blog")}
                  className="w-full sm:w-auto px-4 md:px-5 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white font-medium rounded-full shadow-lg hover:scale-105 transform transition duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  <BookOpen className="w-4 h-4" />
                  Create Blog
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Patient Search */}
        <div className="flex justify-center mt-10">
          <form onSubmit={handleSearch} className="w-full md:w-1/2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Enter Patient UID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full border border-teal-300 rounded-full px-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm text-gray-700"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition font-medium shadow-md flex items-center gap-2"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Display Searched Patient */}
        {searchedUser && (
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-4 md:p-6 flex flex-col gap-4 mt-6 w-full max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <img
                src={getFullImageURL(searchedUser.img)}
                alt={searchedUser.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-teal-300"
              />
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-semibold text-gray-800">
                  {searchedUser.name}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  {searchedUser.email}
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  UID: {searchedUser.uid}
                </p>
                {searchedUser.mobileNo && (
                  <p className="text-gray-500 text-sm mt-1">
                    Phone: {searchedUser.mobileNo}
                  </p>
                )}
                {searchedUser.bloodGroup && (
                  <p className="text-gray-500 text-sm mt-1">
                    Blood Group: {searchedUser.bloodGroup}
                  </p>
                )}
              </div>
              <button
                className="w-full md:w-auto bg-gradient-to-r from-teal-400 to-teal-600 text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:scale-105 transform transition duration-300 shadow-lg flex items-center justify-center text-sm md:text-base"
                onClick={() => handleSeeDetails(searchedUser)}
              >
                See All Details
              </button>
            </div>

            {/* Medical Information */}
            <div className="border-t pt-4 space-y-2">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Allergies:
                  </span>
                  <span className="text-sm text-gray-800">
                    {searchedUser.hasAllergy ? (
                      <span className="text-red-600">
                        Yes - {searchedUser.allergyDetails || "Not specified"}
                      </span>
                    ) : (
                      <span className="text-green-600">No</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    Diabetic Level:
                  </span>
                  <span className="text-sm text-gray-800">
                    {searchedUser.diabeticLevel ? (
                      <span
                        className={`font-medium ${
                          parseFloat(searchedUser.diabeticLevel) >= 6.5
                            ? "text-red-600"
                            : parseFloat(searchedUser.diabeticLevel) >= 5.7
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {searchedUser.diabeticLevel}%
                        {parseFloat(searchedUser.diabeticLevel) >= 6.5
                          ? " (Diabetic)"
                          : parseFloat(searchedUser.diabeticLevel) >= 5.7
                          ? " (Pre-diabetic)"
                          : " (Normal)"}
                      </span>
                    ) : (
                      <span className="text-gray-400">Not recorded</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
