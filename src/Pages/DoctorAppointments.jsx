import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../Components/Context/AuthContext";
import { authGet, authFetch } from "../utils/api";
import Header from "../Components/Shared/Header";
import Footer from "../Components/Shared/Footer";
import {
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";

const DoctorAppointments = () => {
  const { user, loading: userLoading } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all"); // all, pending, approved, completed, rejected
  const [searchDate, setSearchDate] = useState("");

  // Fetch Appointments
  const fetchAppointments = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError("");

    try {
      const res = await authGet(`/appointments/doctor/${user.email}`);
      const data = await res.json();

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        throw new Error("Failed to fetch appointments");
      }
    } catch (err) {
      console.error(err);
      setError("Could not load appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when user is loaded
  useEffect(() => {
    if (!userLoading && user?.email) {
      fetchAppointments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userLoading]);

  // Handle Approve / Reject / Complete
  const handleStatus = async (id, status) => {
    try {
      const res = await authFetch(`/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAppointments(); // refresh list
      }
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((appt) => {
    const matchesStatus =
      selectedStatus === "all" || appt.status === selectedStatus;

    if (!searchDate) return matchesStatus;

    const apptDate = new Date(appt.appointmentDate).toLocaleDateString();
    const searchDateFormatted = new Date(searchDate).toLocaleDateString();
    return matchesStatus && apptDate === searchDateFormatted;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-50 border-green-200 text-green-700";
      case "completed":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle size={16} className="text-green-600" />;
      case "completed":
        return <CheckCircle size={16} className="text-blue-600" />;
      case "rejected":
        return <XCircle size={16} className="text-red-600" />;
      case "pending":
        return <Clock3 size={16} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const statsBar = [
    { label: "All", value: "all", count: appointments.length },
    {
      label: "Pending",
      value: "pending",
      count: appointments.filter((a) => a.status === "pending").length,
    },
    {
      label: "Approved",
      value: "approved",
      count: appointments.filter((a) => a.status === "approved").length,
    },
    {
      label: "Completed",
      value: "completed",
      count: appointments.filter((a) => a.status === "completed").length,
    },
    {
      label: "Cancelled",
      value: "rejected",
      count: appointments.filter((a) => a.status === "rejected").length,
    },
  ];

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff]">
      <Header />
      <main className="flex-1 overflow-y-auto w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent mb-2">
              My Appointments
            </h1>
            <p className="text-[#304d5d] font-medium">
              Manage your appointments and patient bookings
            </p>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            {statsBar.map((stat) => (
              <button
                key={stat.value}
                onClick={() => setSelectedStatus(stat.value)}
                className={`p-4 rounded-lg font-semibold transition-all duration-200 text-center ${
                  selectedStatus === stat.value
                    ? "bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white shadow-lg"
                    : "bg-white/80 text-[#304d5d] border border-white/50 hover:shadow-md"
                }`}
              >
                <div className="text-2xl font-bold">{stat.count}</div>
                <div className="text-xs">{stat.label}</div>
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-md">
            <label className="text-sm font-semibold text-[#304d5d] mb-2 block">
              Search by Date
            </label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full md:w-64 px-4 py-2 border border-[#67cffe]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#67cffe] transition-all"
            />
            {searchDate && (
              <button
                onClick={() => setSearchDate("")}
                className="mt-2 text-sm text-[#67cffe] hover:text-[#304d5d] font-semibold"
              >
                Clear Filter
              </button>
            )}
          </div>

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-[#67cffe]/30 border-t-[#67cffe] rounded-full animate-spin"></div>
              <p className="mt-4 text-[#304d5d] font-medium">
                Loading appointments...
              </p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <p className="text-red-700 font-medium mb-4">{error}</p>
              <button
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all"
                onClick={fetchAppointments}
              >
                Retry
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-white/50">
              <Calendar
                size={48}
                className="mx-auto text-[#67cffe] mb-4 opacity-50"
              />
              <p className="text-[#304d5d] font-medium">
                {searchDate
                  ? "No appointments found for this date"
                  : "No appointments found"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
              {filteredAppointments.map((appt, index) => (
                <div
                  key={appt._id}
                  className={`group bg-white/90 backdrop-blur-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border-l-4 ${
                    appt.status === "approved"
                      ? "border-l-green-500"
                      : appt.status === "completed"
                        ? "border-l-blue-500"
                        : appt.status === "rejected"
                          ? "border-l-red-500"
                          : "border-l-yellow-500"
                  } p-5 animate-scaleIn`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#67cffe]/20 to-[#304d5d]/10 flex items-center justify-center flex-shrink-0">
                        <User size={20} className="text-[#67cffe]" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-[#304d5d] truncate">
                          {appt.patientName}
                        </h3>
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(appt.status)} mt-1`}
                        >
                          {getStatusIcon(appt.status)}
                          <span className="capitalize">{appt.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail
                        size={14}
                        className="text-[#67cffe] flex-shrink-0"
                      />
                      <span className="truncate text-xs">
                        {appt.patientEmail}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin
                        size={14}
                        className="text-[#67cffe] flex-shrink-0"
                      />
                      <span className="text-xs font-medium">
                        {appt.chamber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar
                        size={14}
                        className="text-[#67cffe] flex-shrink-0"
                      />
                      <span className="text-xs">
                        {new Date(appt.appointmentDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock
                        size={14}
                        className="text-[#67cffe] flex-shrink-0"
                      />
                      <span className="text-xs font-medium">
                        {appt.appointmentTime}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  {appt.status === "pending" ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleStatus(appt._id, "approved")}
                        className="flex-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatus(appt._id, "rejected")}
                        className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                      >
                        Reject
                      </button>
                    </div>
                  ) : appt.status === "approved" ? (
                    <button
                      onClick={() => handleStatus(appt._id, "completed")}
                      className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-all duration-200"
                    >
                      Mark Completed
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorAppointments;
