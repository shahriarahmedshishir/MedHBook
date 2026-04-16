import React, { useEffect, useState, useContext } from "react";
import AuthContext from "../Components/Context/AuthContext";
import { authGet, authFetch } from "../utils/api";
import Header from "../Components/Shared/Header";
import Footer from "../Components/Shared/Footer";

const DoctorAppointments = () => {
  const { user, loading: userLoading } = useContext(AuthContext);

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Handle Approve / Reject
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

  if (userLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto w-full">
        <div className="p-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-[#007b8f]">
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
            <div>No appointments found.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {appointments.map((appt) => (
                <div
                  key={appt._id}
                  className="bg-white border border-[#b9efff] shadow-md rounded-xl p-6 flex flex-col gap-2 hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="font-semibold text-lg text-[#007b8f]">
                    Patient: {appt.patientName}
                  </div>

                  <div className="text-sm text-gray-600">
                    Email:{" "}
                    <span className="font-medium text-[#304d5d]">
                      {appt.patientEmail}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Chamber: <span className="font-medium">{appt.chamber}</span>
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
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleStatus(appt._id, "approved")}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleStatus(appt._id, "rejected")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
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
