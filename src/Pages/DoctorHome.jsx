import { useState, useContext } from "react";
import { Search } from "lucide-react";
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
        `${import.meta.env.VITE_SERVER_URL || "http://localhost:3000"}/user`
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Doctor Card */}
        {user && (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex items-center gap-6">
            <img
              src={getFullImageURL(user.img)}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover border border-gray-300"
            />
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {user.name}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <p className="text-gray-500 text-sm mt-1">UID: {user.uid}</p>
            </div>
          </div>
        )}

        {/* Patient Search */}
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

        {/* Display Searched Patient */}
        {searchedUser && (
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6 mt-6">
            <img
              src={getFullImageURL(searchedUser.img)}
              alt={searchedUser.name}
              className="w-24 h-24 rounded-full object-cover border border-gray-300"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800">
                {searchedUser.name}
              </h3>
              <p className="text-gray-600">{searchedUser.email}</p>
              <p className="text-gray-500 text-sm mt-1">
                UID: {searchedUser.uid}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Role: {searchedUser.role}
              </p>
            </div>
            <button
              className="bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition"
              onClick={() => handleSeeDetails(searchedUser)}
            >
              See All Details
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
