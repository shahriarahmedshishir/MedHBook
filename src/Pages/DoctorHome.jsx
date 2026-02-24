import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import {
  Search,
  Mail,
  Phone,
  Award,
  Briefcase,
  Stethoscope,
  Star,
  MapPin,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

// Smart helper to get full image URL
const getFullImageURL = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath; // already full URL
  return `${
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
  }${imgPath}`;
};

const DoctorHome = () => {
  const { user, refreshUser } = useContext(AuthContext); // logged-in doctor
  const [searchId, setSearchId] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const hasRefreshed = useRef(false); // Track if we've done initial refresh
  const navigate = useNavigate();

  // Force refresh user data when user email is available (only once)
  useEffect(() => {
    if (user?.email && refreshUser && !hasRefreshed.current) {
      console.log("DoctorHome - Initial refresh triggered for:", user.email);
      refreshUser();
      hasRefreshed.current = true;
    }
  }, [user?.email, refreshUser]); // Trigger when user email becomes available

  // Construct user image URL same as edit profile pages
  const userImageURL = user?.img
    ? user.img.startsWith("http")
      ? user.img
      : `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}${user.img}`
    : null;

  // Debug: Log user image info
  useEffect(() => {
    console.log("DoctorHome - user object:", user);
    console.log("DoctorHome - user.img:", user?.img);
    console.log("DoctorHome - constructed URL:", userImageURL);
  }, [user, userImageURL]);

  // Search patient by UID
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return alert("Enter a User ID");

    setLoading(true);
    try {
      const res = await fetch(
        `${
          import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
        }/user?role=patient`,
      );
      if (!res.ok) throw new Error("Failed to fetch users");

      const users = await res.json();
      const patient = users.find((u) => Number(u.uid) === Number(searchId));

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-6xl mx-auto flex flex-col gap-6 relative z-10">
        <div className="flex flex-col items-center justify-center px-4 h-[calc(35vh)] animate-fadeIn">
          <h1
            className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent 
               bg-gradient-to-r from-[#304d5d] via-[#67cffe] to-[#304d5d]
               overflow-hidden
               whitespace-nowrap md:whitespace-normal
               mx-auto text-center
               max-w-[90vw] md:max-w-3xl"
          >
            MedHBook — a smart digital system to store, access, and share
            medical records securely in one place.
          </h1>
          <p className="mt-4 text-base md:text-lg font-bold tracking-wide text-[#304d5d] text-center typewriter">
            Your Health. Your Records. One Book.
          </p>
        </div>
        {/* Doctor Card */}
        {user && (
          <div className="flex justify-center mt-6 md:mt-10 px-4 animate-scaleIn">
            <div className="relative bg-gradient-to-br from-white via-white to-[#67cffe]/5 rounded-3xl shadow-2xl hover:shadow-[#67cffe]/40 transition-all duration-500 hover:-translate-y-2 p-6 md:p-8 w-full max-w-4xl border-2 border-[#67cffe]/20 overflow-hidden group">
              {/* Decorative background elements */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#67cffe]/10 rounded-full blur-3xl group-hover:bg-[#67cffe]/20 transition-all duration-500"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#304d5d]/10 rounded-full blur-2xl group-hover:bg-[#304d5d]/20 transition-all duration-500"></div>

              <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Profile Image Section */}
                <div className="relative">
                  {userImageURL ? (
                    <div className="relative">
                      <img
                        src={userImageURL}
                        alt={user.name}
                        className="w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border-4 border-[#67cffe] shadow-xl ring-4 ring-[#67cffe]/20 transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white p-2 rounded-xl shadow-lg">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl border-4 border-[#67cffe] bg-gradient-to-br from-[#67cffe] to-[#304d5d] flex items-center justify-center shadow-xl ring-4 ring-[#67cffe]/20 transition-transform duration-300 group-hover:scale-105">
                        <span className="text-white text-4xl md:text-5xl font-bold">
                          {user.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white p-2 rounded-xl shadow-lg">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  {/* Name and Specialization */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
                      {doctor?.name || user.name}
                    </h2>
                    {doctor?.specialization && (
                      <div className="inline-flex items-center gap-2 mt-2 px-4 py-1.5 bg-gradient-to-r from-[#67cffe] to-[#304d5d] text-white rounded-full text-sm font-semibold shadow-md">
                        <Star className="w-4 h-4 fill-white" />
                        {doctor.specialization}
                      </div>
                    )}
                  </div>

                  {/* Contact and Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {/* Email */}
                    <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-xl px-3 py-2 shadow-sm">
                      <Mail className="w-4 h-4 text-[#67cffe]" />
                      <span className="text-sm truncate">
                        {doctor?.email || user.email}
                      </span>
                    </div>

                    {/* Phone */}
                    {doctor?.phone && (
                      <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-xl px-3 py-2 shadow-sm">
                        <Phone className="w-4 h-4 text-[#67cffe]" />
                        <span className="text-sm">{doctor.phone}</span>
                      </div>
                    )}

                    {/* Experience */}
                    {doctor?.yearsOfExperience && (
                      <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-xl px-3 py-2 shadow-sm">
                        <Briefcase className="w-4 h-4 text-[#67cffe]" />
                        <span className="text-sm font-medium">
                          {doctor.yearsOfExperience} years experience
                        </span>
                      </div>
                    )}

                    {/* License/Qualification Badge */}
                    {(doctor?.qualification || doctor?.licenseNumber) && (
                      <div className="flex items-center gap-2 text-gray-700 bg-white/50 rounded-xl px-3 py-2 shadow-sm">
                        <Award className="w-4 h-4 text-[#67cffe]" />
                        <span className="text-sm font-medium">
                          {doctor.qualification ||
                            `License: ${doctor.licenseNumber}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Chambers */}
                  {doctor?.chambers && doctor.chambers.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-xs font-semibold text-[#304d5d] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Chambers:
                      </h4>
                      {doctor.chambers.map((chamber, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gradient-to-r from-[#67cffe]/10 to-[#304d5d]/10 rounded-xl border border-[#67cffe]/20"
                        >
                          <p className="text-sm font-semibold text-[#304d5d]">
                            {chamber.name}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {chamber.address}
                          </p>
                          {chamber.phone && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {chamber.phone}
                            </p>
                          )}
                          {chamber.startTime && chamber.endTime && (
                            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {chamber.startTime} - {chamber.endTime}
                            </p>
                          )}
                          {chamber.workingDays &&
                            chamber.workingDays.length > 0 && (
                              <p className="text-xs text-gray-600 mt-1">
                                Days: {chamber.workingDays.join(", ")}
                              </p>
                            )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Patient Search */}
        <div className="flex justify-center mt-10">
          <form onSubmit={handleSearch} className="w-full md:w-1/2 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#67cffe]">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Enter Patient UID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full border-2 border-[#67cffe]/30 rounded-full px-12 py-3 focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 shadow-sm text-gray-700 bg-white/90 backdrop-blur-sm transition-all duration-300"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white px-6 py-2 rounded-full hover:shadow-xl hover:shadow-[#67cffe]/30 transition-all duration-300 font-semibold shadow-md flex items-center gap-2"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>
        {/* Display Searched Patient */}
        {searchedUser && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-[#67cffe]/30 transition-all duration-300 hover:-translate-y-1 p-4 md:p-6 flex flex-col gap-4 mt-6 w-full max-w-3xl mx-auto border border-white/20 animate-scaleIn">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              {searchedUser.img ? (
                <img
                  src={
                    searchedUser.img.startsWith("http")
                      ? searchedUser.img
                      : `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}${searchedUser.img}`
                  }
                  alt={searchedUser.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-[#67cffe] shadow-lg"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-[#67cffe] bg-gradient-to-br from-[#67cffe] to-[#304d5d] flex items-center justify-center shadow-lg">
                  <span className="text-white text-3xl md:text-4xl font-bold">
                    {searchedUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-lg md:text-xl font-bold text-[#304d5d]">
                  {searchedUser.name}
                </h3>
                <p className="text-gray-600 text-sm md:text-base">
                  {searchedUser.email}
                </p>
                <p className="text-gray-600 text-sm mt-1">
                  UID: {searchedUser.uid}
                </p>
                {searchedUser.mobileNo && (
                  <p className="text-gray-600 text-sm mt-1">
                    Phone: {searchedUser.mobileNo}
                  </p>
                )}
                {searchedUser.bloodGroup && (
                  <p className="text-[#67cffe] font-semibold text-sm mt-1">
                    Blood Group: {searchedUser.bloodGroup}
                  </p>
                )}
              </div>
              <button
                className="w-full md:w-auto bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white px-4 md:px-6 py-2 md:py-3 rounded-full hover:shadow-xl hover:shadow-[#67cffe]/30 hover:-translate-y-0.5 transform transition duration-300 shadow-lg flex items-center justify-center text-sm md:text-base font-semibold"
                onClick={() => handleSeeDetails(searchedUser)}
              >
                See All Details
              </button>
            </div>

            {/* Medical Information */}
            <div className="border-t-2 border-gray-200 pt-4 space-y-2">
              <h4 className="text-sm font-bold text-[#304d5d] mb-2">
                Medical Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Allergies:
                  </span>
                  <span className="text-sm text-gray-800">
                    {searchedUser.hasAllergy ? (
                      <span className="text-red-600 font-medium">
                        Yes - {searchedUser.allergyDetails || "Not specified"}
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">No</span>
                    )}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Diabetic Level:
                  </span>
                  <span className="text-sm text-gray-800">
                    {searchedUser.diabeticLevel ? (
                      <span
                        className={`font-semibold ${
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
