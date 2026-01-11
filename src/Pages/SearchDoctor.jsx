import { useState } from "react";
import axios from "axios";
import { Search, MapPin, Mail, Phone, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const getFullImageURL = (imgPath) => {
  if (!imgPath) return "https://i.pravatar.cc/100";
  if (imgPath.startsWith("http")) return imgPath;
  const serverURL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
  return `${serverURL}${imgPath}`;
};

const SearchDoctor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("name"); // name, specialty, email
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please enter a search term");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = {};
      params[searchType] = searchQuery;

      const response = await axios.get("http://localhost:3000/search/doctors", {
        params,
      });

      setDoctors(response.data);
      setSearched(true);

      if (response.data.length === 0) {
        setError("No doctors found matching your search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to search doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Find a Doctor
          </h1>
          <p className="text-gray-600">
            Search for doctors by name, specialty, or email
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Type Selector */}
            <div className="flex gap-4 mb-6">
              {["name", "specialty", "email"].map((type) => (
                <label key={type} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="searchType"
                    value={type}
                    checked={searchType === type}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                  />
                  <span className="ml-2 text-gray-700 capitalize font-medium">
                    Search by {type}
                  </span>
                </label>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Enter doctor ${searchType}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              />
              <Search
                className="absolute left-3 top-3.5 text-gray-400"
                size={20}
              />
            </div>

            {/* Search Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {searched && doctors.length > 0 && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Found {doctors.length} Doctor{doctors.length !== 1 ? "s" : ""}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doctor, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition duration-300 transform hover:-translate-y-1"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-24"></div>

                  <div className="p-6 -mt-12 relative">
                    {/* Doctor Avatar */}
                    {doctor.img ? (
                      <img
                        src={getFullImageURL(doctor.img)}
                        alt={doctor.name}
                        className="w-20 h-20 rounded-full border-4 border-white mb-4 object-cover"
                        onError={(e) => {
                          e.target.src = "https://i.pravatar.cc/100";
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full border-4 border-white bg-gray-300 mb-4 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-600">
                          {doctor.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <h3 className="text-xl font-bold text-gray-800 mb-3">
                      {doctor.name || "N/A"}
                    </h3>

                    {doctor.doctorType && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(doctor.doctorType) ? (
                            doctor.doctorType.map((type, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold"
                              >
                                <Award size={12} />
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                              <Award size={12} />
                              {doctor.doctorType}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.specialization && (
                      <div className="text-gray-600 mb-2">
                        <p className="text-xs text-gray-500">Specialization:</p>
                        <p className="text-sm font-medium">
                          {doctor.specialization}
                        </p>
                      </div>
                    )}

                    {doctor.degree && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 mb-1">Degree:</p>
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(doctor.degree) ? (
                            doctor.degree.map((deg, idx) => (
                              <span
                                key={idx}
                                className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs"
                              >
                                {deg}
                              </span>
                            ))
                          ) : (
                            <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">
                              {doctor.degree}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {doctor.college && (
                      <div className="text-gray-600 mb-2">
                        <p className="text-xs text-gray-500">College:</p>
                        <p className="text-sm font-medium">{doctor.college}</p>
                      </div>
                    )}

                    {doctor.yearsOfExperience && (
                      <div className="text-gray-600 mb-2">
                        <p className="text-xs text-gray-500">Experience:</p>
                        <p className="text-sm font-medium">
                          {doctor.yearsOfExperience} years
                        </p>
                      </div>
                    )}

                    {doctor.email && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <Mail size={16} className="mr-2" />
                        <p className="text-sm break-all">{doctor.email}</p>
                      </div>
                    )}

                    {doctor.phone && (
                      <div className="flex items-center text-gray-600 mb-2">
                        <Phone size={16} className="mr-2" />
                        <p className="text-sm">{doctor.phone}</p>
                      </div>
                    )}

                    {doctor.location && (
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPin size={16} className="mr-2" />
                        <p className="text-sm">{doctor.location}</p>
                      </div>
                    )}

                    {doctor.experience && (
                      <p className="text-sm text-gray-700 mb-4">
                        <span className="font-semibold">Experience:</span>{" "}
                        {doctor.experience} years
                      </p>
                    )}

                    {doctor.bio && (
                      <p className="text-sm text-gray-600 mb-4">{doctor.bio}</p>
                    )}

                    {/* Action Button */}
                    <button
                      onClick={() =>
                        navigate(`/doctor-profile/${doctor._id}`, {
                          state: { doctor },
                        })
                      }
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition duration-300"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {searched && doctors.length === 0 && !error && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              No doctors found. Try a different search.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searched && doctors.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">
              Start searching to find doctors
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDoctor;
