import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";
import { authGet, authPost } from "../utils/api";

const timeToMinutes = (timeStr) => {
  if (!timeStr || !timeStr.includes(":")) return NaN;
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return NaN;
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes) => {
  const safeMinutes = Math.max(0, Math.min(totalMinutes, 24 * 60 - 1));
  const h = String(Math.floor(safeMinutes / 60)).padStart(2, "0");
  const m = String(safeMinutes % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const findNextAvailableTime = (requestedTime, blockedMinutesSet) => {
  const requestedMinutes = timeToMinutes(requestedTime);
  if (Number.isNaN(requestedMinutes)) return "";
  if (!blockedMinutesSet.has(requestedMinutes)) return requestedTime;

  let next = requestedMinutes + 1;
  while (next < 24 * 60 && blockedMinutesSet.has(next)) {
    next += 1;
  }

  return next < 24 * 60 ? minutesToTime(next) : "";
};

const Appointment = () => {
  const { doctorId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [selectedChamber, setSelectedChamber] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [suggestedTime, setSuggestedTime] = useState("");

  // Robust doctor fetch with retry
  const fetchDoctor = async () => {
    setLoading(true);
    setError("");
    try {
      const serverURL =
        import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
      const res = await fetch(`${serverURL}/doctors/${doctorId}`);
      if (!res.ok) throw new Error("Failed to fetch doctor info");
      const data = await res.json();
      if (!data || !data._id) throw new Error("Doctor not found");
      setDoctor(data);
    } catch {
      setError("Could not load doctor info. Please try again.");
      setDoctor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (doctorId) fetchDoctor();
    // eslint-disable-next-line
  }, [doctorId]);

  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (!doctor?.email || !selectedChamber || !selectedDate) {
        setBlockedSlots([]);
        setSuggestedTime("");
        return;
      }

      try {
        const query = `/appointments/booked/slots?doctorEmail=${encodeURIComponent(
          doctor.email,
        )}&chamber=${encodeURIComponent(selectedChamber)}&appointmentDate=${encodeURIComponent(
          selectedDate,
        )}`;
        const res = await authGet(query);
        const data = await res.json();
        if (data?.success && Array.isArray(data.blockedSlots)) {
          setBlockedSlots(data.blockedSlots);
        } else {
          setBlockedSlots([]);
        }
      } catch {
        setBlockedSlots([]);
      }
    };

    fetchBookedSlots();
  }, [doctor?.email, selectedChamber, selectedDate]);

  useEffect(() => {
    if (!selectedTime || blockedSlots.length === 0) {
      setSuggestedTime("");
      return;
    }

    const blockedSet = new Set(blockedSlots);
    const selectedMinutes = timeToMinutes(selectedTime);

    if (!blockedSet.has(selectedMinutes)) {
      setSuggestedTime("");
      return;
    }

    const next = findNextAvailableTime(selectedTime, blockedSet);
    setSuggestedTime(next);
    setAppointmentError(
      next
        ? `Selected time is not available. Next available time: ${next}`
        : "Selected time is not available for this date.",
    );
  }, [selectedTime, blockedSlots]);

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    setAppointmentError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedChamber || !selectedDate || !selectedTime)
      return alert("Select chamber, date, and time");

    setSubmitting(true);
    setAppointmentError("");

    try {
      const blockedSet = new Set(blockedSlots);
      const selectedMinutes = timeToMinutes(selectedTime);
      if (blockedSet.has(selectedMinutes)) {
        const next = findNextAvailableTime(selectedTime, blockedSet);
        const errorMsg = next
          ? `Selected time is not available. Try ${next}.`
          : "Selected time is not available for this date.";
        setAppointmentError(errorMsg);
        setSuggestedTime(next);
        alert(errorMsg);
        setSubmitting(false);
        return;
      }

      const chamberObj = doctor.chambers.find(
        (c) => c.name === selectedChamber,
      );
      // doctorSpecialty: flatten to string if array
      let specialty = doctor.specialization || doctor.doctorType;
      if (Array.isArray(specialty)) specialty = specialty.join(", ");
      console.log("Appointment.jsx: doctor._id", doctor._id);
      const payload = {
        doctorEmail: doctor.email,
        doctorName: doctor.name,
        doctorSpecialty: specialty,
        chamber: selectedChamber,
        chamberAddress: chamberObj?.address || "",
        chamberTime: `${chamberObj?.startTime || ""} - ${chamberObj?.endTime || ""}`,
        patientEmail: user.email,
        patientName: user.name,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
      };
      console.log("Appointment.jsx: user object", user);
      console.log("Appointment.jsx: appointment payload", payload);

      const res = await authPost("/appointments", payload);
      const data = await res.json();

      if (data.success) {
        alert("Appointment request submitted!");
        navigate("/patient/appointments");
      } else {
        // Show conflict error or other errors
        const errorMsg = data.message || "Failed to submit appointment";
        setAppointmentError(errorMsg);
        alert(errorMsg);
      }
    } catch {
      const errorMsg = "Failed to submit appointment. Please try again.";
      setAppointmentError(errorMsg);
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        {error}
        <br />
        <button
          className="mt-4 px-4 py-2 bg-[#67cffe] text-white rounded"
          onClick={fetchDoctor}
        >
          Retry
        </button>
      </div>
    );
  if (!doctor)
    return (
      <div className="p-8 text-center text-red-500">
        Doctor not found.
        <br />
        <button
          className="mt-4 px-4 py-2 bg-[#67cffe] text-white rounded"
          onClick={fetchDoctor}
        >
          Retry
        </button>
      </div>
    );

  return (
    <section className="w-full flex-1 px-4 flex flex-col justify-center items-center">
      <div className="max-w-lg w-full bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-[#304d5d]">
          Book Appointment
        </h2>
        <div className="mb-6">
          <div className="font-semibold text-lg">{doctor.name}</div>
          <div className="text-sm text-gray-600 mb-1">
            {doctor.specialization || doctor.doctorType}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Select Chamber</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={selectedChamber}
              onChange={(e) => setSelectedChamber(e.target.value)}
              required
            >
              <option value="">-- Select Chamber --</option>
              {doctor.chambers && doctor.chambers.length > 0 ? (
                doctor.chambers.map((chamber, idx) => (
                  <option key={idx} value={chamber.name}>
                    {chamber.name} ({chamber.address})
                  </option>
                ))
              ) : (
                <option disabled>No chambers available</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Select Date</label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Select Time</label>
            <input
              type="time"
              className="w-full border rounded px-3 py-2"
              value={selectedTime}
              onChange={handleTimeChange}
              required
              placeholder="Select time"
            />
          </div>
          {appointmentError && (
            <p className="text-sm text-red-600 font-medium">
              {appointmentError}
            </p>
          )}
          {suggestedTime && (
            <button
              type="button"
              className="w-full border border-[#304d5d] text-[#304d5d] font-semibold py-2 rounded-lg hover:bg-[#f1f7fa] transition"
              onClick={() => {
                setSelectedTime(suggestedTime);
                setSuggestedTime("");
                setAppointmentError("");
              }}
            >
              Use suggested time: {suggestedTime}
            </button>
          )}
          <button
            type="submit"
            className="w-full bg-linear-to-r from-[#304d5d] to-[#67cffe] text-white font-bold py-3 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Appointment"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Appointment;
