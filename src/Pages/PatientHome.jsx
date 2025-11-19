// src/Pages/PatientHome.jsx
import { CalendarCheck, FileText, Pill, File } from "lucide-react";
import { Link } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";

const PatientHome = () => {
  const handleReminder = () => alert("Reminder feature coming soon!");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="flex flex-col items-center justify-center px-4 h-[calc(35vh)]">
        <h1
          className="text-2xl md:text-4xl font-extrabold bg-clip-text text-transparent 
               bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300
               overflow-hidden border-r-4
               whitespace-nowrap md:whitespace-normal
               mx-auto text-center
               max-w-[90vw] md:max-w-3xl"
        >
          MedHBook — a smart digital system to store, access, and share medical
          records securely in one place.
        </h1>

        <p className="mt-4 text-base md:text-lg font-semibold tracking-wide text-black/90 text-center typewriter">
          Your Health. Your Records. One Book.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col justify-center items-center">
        <p className="text-gray-600 mb-10 text-center md:text-left">
          Manage your prescriptions and test reports.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 w-full">
          {/* Buttons for Prescriptions and Reports */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to="/patient/prescriptions" // Navigate to the new prescriptions page
              className="flex flex-col items-center justify-center bg-[#f0fdfa] rounded-xl p-6 hover:shadow-lg transition cursor-pointer border border-teal-200"
            >
              <Pill className="w-12 h-12 text-teal-500 mb-3" />
              <h2 className="text-lg font-semibold mb-2">Open Prescriptions</h2>
            </Link>

            <Link
              to="/patient/reports" // Navigate to the new reports page
              className="flex flex-col items-center justify-center bg-[#f0fdfa] rounded-xl p-6 hover:shadow-lg transition cursor-pointer border border-teal-200"
            >
              <File className="w-12 h-12 text-teal-500 mb-3" />
              <h2 className="text-lg font-semibold mb-2">Open Reports</h2>
            </Link>
          </div>

          {/* Set Reminder Button */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleReminder}
              className="flex items-center justify-center bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition font-medium gap-2"
            >
              <CalendarCheck className="w-5 h-5" /> Set Reminder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
