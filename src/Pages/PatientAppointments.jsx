import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../Components/Context/AuthContext";
import { authGet, authDelete } from "../utils/api";
import RootLayout from "../Components/Layouts/RootLayout";
import Header from "../Components/Shared/Header";
import Footer from "../Components/Shared/Footer";

const PatientAppointments = () => {
  const { user } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch appointments
  const fetchAppointments = async () => {
    if (!user?.email) return;

    setLoading(true);
    setError("");

    try {
      const res = await authGet(`/appointments/patient/${user.email}`);
      const data = await res.json();

      if (data.success) {
        setAppointments(data.appointments);
      } else {
        throw new Error("Failed to load appointments");
      }
    } catch (err) {
      console.error(err);
      setError("Could not load appointments. Please try again.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?",
    );
    if (!confirmCancel) return;

    try {
      const res = await authDelete(`/appointments/${id}`);
      if (!res.ok) throw new Error("Failed to cancel appointment");

      // Remove from UI instantly
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to cancel appointment");
    }
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 z-50">
        <Header />
      </div>

      {/* Content — full viewport height */}
      <main className="min-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6 text-[#304d5d]">
            My Appointments
          </h2>

          {loading ? (
            <div>Loading appointments...</div>
          ) : error ? (
            <div>
              <p className="text-red-600">{error}</p>
              <button
                className="mt-4 px-4 py-2 bg-[#67cffe] text-white rounded"
                onClick={fetchAppointments}
              >
                Retry
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-500">
              No appointments found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white border border-[#b9efff] shadow-md rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="font-semibold text-lg text-[#007b8f]">
                    Dr. {appt.doctorName}
                  </div>

                  <div className="text-sm text-gray-600">
                    Chamber:{" "}
                    <span className="font-medium text-[#304d5d]">
                      {appt.chamber}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Date:{" "}
                    <span className="font-medium">
                      {new Date(appt.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Time:{" "}
                    <span className="font-medium">{appt.appointmentTime}</span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Status:{" "}
                    <span
                      className={
                        appt.status === "approved"
                          ? "text-green-600 font-semibold"
                          : appt.status === "rejected"
                            ? "text-red-600 font-semibold"
                            : "text-yellow-600 font-semibold"
                      }
                    >
                      {appt.status}
                    </span>
                  </div>

                  {appt.status === "pending" && (
                    <button
                      className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                      onClick={() => handleCancel(appt._id)}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Fixed Footer */}
      <div className="flex-shrink-0 z-50">
        <Footer />
      </div>
    </div>
  );
};

export default PatientAppointments;
