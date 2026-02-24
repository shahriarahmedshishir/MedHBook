import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Award,
} from "lucide-react";

const ManageDoctorApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const fetchApplications = async () => {
    try {
      const serverURL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${serverURL}/doctor-applications?status=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleApprove = async (applicationId, applicantEmail) => {
    try {
      const serverURL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${serverURL}/doctor-applications/${applicationId}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: applicantEmail }),
        },
      );

      if (response.ok) {
        alert("Application approved! User is now a doctor.");
        fetchApplications();
      } else {
        alert("Failed to approve application");
      }
    } catch (err) {
      console.error("Error approving application:", err);
      alert("Error approving application");
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const serverURL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const token = localStorage.getItem("authToken");

      const response = await fetch(
        `${serverURL}/doctor-applications/${applicationId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.ok) {
        alert("Application rejected");
        fetchApplications();
      } else {
        alert("Failed to reject application");
      }
    } catch (err) {
      console.error("Error rejecting application:", err);
      alert("Error rejecting application");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Doctor Applications
        </h1>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {["pending", "approved", "rejected"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-3 font-semibold capitalize transition ${
                filter === status
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-600 hover:text-indigo-600"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            No {filter} applications found
          </div>
        ) : (
          <div className="grid gap-6">
            {applications.map((app) => (
              <div key={app._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        {app.name}
                      </h3>
                      <p className="text-gray-600">{app.specialization}</p>
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      app.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : app.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    <Clock className="inline w-4 h-4 mr-1" />
                    {app.status}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span>{app.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <span>{app.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Award className="w-4 h-4" />
                    <span>
                      {app.qualification} - {app.experience} years exp.
                    </span>
                  </div>
                  <div className="text-gray-700">
                    <strong>Hospital:</strong> {app.hospital}
                  </div>
                  <div className="text-gray-700">
                    <strong>License:</strong> {app.licenseNumber}
                  </div>
                </div>

                {app.aboutMe && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">
                      About:
                    </p>
                    <p className="text-gray-600">{app.aboutMe}</p>
                  </div>
                )}

                {app.status === "pending" && (
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={() => handleApprove(app._id, app.email)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(app._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDoctorApplications;
