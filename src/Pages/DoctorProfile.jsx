import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Award, MapPin, FileText } from "lucide-react";

const getFullImageURL = (imgPath) => {
  if (!imgPath) return null;
  if (imgPath.startsWith("http")) return imgPath;
  return `${
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
  }${imgPath}`;
};

const DoctorProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctor } = location.state || {};

  console.log("=== DOCTOR PROFILE LOADED ===");
  console.log("Doctor object:", doctor);
  console.log("Doctor email:", doctor?.email);
  console.log("Doctor name:", doctor?.name);

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Doctor not found</p>
          <button
            onClick={() => navigate("/search-doctor")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/search-doctor")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-6 font-medium"
        >
          <ArrowLeft size={20} />
          Back to Search
        </button>

        {/* Doctor Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Background */}
          <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-32"></div>

          {/* Content */}
          <div className="px-6 pb-6">
            {/* Profile Image */}
            <div className="-mt-16 mb-6">
              {doctor.img && getFullImageURL(doctor.img) ? (
                <img
                  src={getFullImageURL(doctor.img)}
                  alt={doctor.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-gray-600">
                    {doctor.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {doctor.name || "N/A"}
            </h1>

            {doctor.doctorType && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(doctor.doctorType) ? (
                    doctor.doctorType.map((type, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold"
                      >
                        <Award size={16} />
                        {type}
                      </span>
                    ))
                  ) : (
                    <span className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                      <Award size={16} />
                      {doctor.doctorType}
                    </span>
                  )}
                </div>
              </div>
            )}

            {doctor.specialization && (
              <div className="text-gray-600 mb-2">
                <p className="text-sm text-gray-500">Specialization:</p>
                <p className="text-base font-medium">{doctor.specialization}</p>
              </div>
            )}

            {doctor.degree && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Degree:</p>
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(doctor.degree) ? (
                    doctor.degree.map((deg, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {deg}
                      </span>
                    ))
                  ) : (
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                      {doctor.degree}
                    </span>
                  )}
                </div>
              </div>
            )}

            {doctor.college && (
              <div className="text-gray-600 mb-6">
                <p className="text-sm text-gray-500">College / University:</p>
                <p className="text-base font-medium">{doctor.college}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              {doctor.email && (
                <div className="flex items-start gap-3">
                  <Mail
                    size={20}
                    className="text-gray-600 mt-1 flex-shrink-0"
                  />
                  <div>
                    <p className="text-gray-600 font-medium">Email</p>
                    <p className="text-gray-800 break-all">{doctor.email}</p>
                  </div>
                </div>
              )}

              {doctor.phone && (
                <div className="flex items-start gap-3">
                  <Phone
                    size={20}
                    className="text-gray-600 mt-1 flex-shrink-0"
                  />
                  <div>
                    <p className="text-gray-600 font-medium">Phone</p>
                    <p className="text-gray-800">{doctor.phone}</p>
                  </div>
                </div>
              )}

              {doctor.location && (
                <div className="flex items-start gap-3">
                  <MapPin
                    size={20}
                    className="text-gray-600 mt-1 flex-shrink-0"
                  />
                  <div>
                    <p className="text-gray-600 font-medium">Location</p>
                    <p className="text-gray-800">{doctor.location}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {doctor.yearsOfExperience && (
                <div>
                  <p className="text-gray-600 font-medium mb-1">Experience</p>
                  <p className="text-gray-800">
                    {doctor.yearsOfExperience} years
                  </p>
                </div>
              )}

              {doctor.bio && (
                <div>
                  <div className="flex items-start gap-3">
                    <FileText
                      size={20}
                      className="text-gray-600 mt-1 flex-shrink-0"
                    />
                    <div>
                      <p className="text-gray-600 font-medium mb-1">Overview</p>
                      <p className="text-gray-800">{doctor.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Contact Button */}
            <button
              onClick={() => {
                // Check if email exists before navigating
                if (!doctor.email) {
                  console.error("Doctor email not found:", doctor);
                  alert("Unable to contact this doctor - no email found");
                  return;
                }

                console.log("Navigating to chat with:", {
                  doctorEmail: doctor.email,
                  doctorName: doctor.name,
                });

                // Navigate to chat with doctor info passed
                navigate("/chat", {
                  state: {
                    doctorEmail: doctor.email,
                    doctorName: doctor.name,
                  },
                });
              }}
              className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
            >
              Contact Doctor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
