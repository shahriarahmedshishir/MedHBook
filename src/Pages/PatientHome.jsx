import { CalendarCheck, File, Pill, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import Logo from "../Components/Shared/Logo";

const PatientHome = () => {
  const handleReminder = () => alert("Reminder feature coming soon!");

  const [height, setHeight] = useState(""); 
  const [weight, setWeight] = useState(""); 

  const bmi =
    height && weight
      ? (weight / Math.pow(height * 0.3048, 2)).toFixed(1)
      : null;

  const bmiStatus = () => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="max-w-6xl mx-auto text-center mb-12">
        <Logo />
        <p className="mt-3 text-lg font-medium text-gray-800">
          Your Health. Your Records. One Book.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            Medical Records
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/patient/xrays"
              className="group bg-[#f0fdfa] rounded-xl p-6 border border-teal-200 hover:shadow-md transition"
            >
              <Activity className="w-10 h-10 text-teal-500 mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold">X-Rays</h3>
              <p className="text-sm text-gray-600 mt-1">
                View and download scans
              </p>
            </Link>

            <Link
              to="/patient/prescriptions"
              className="group bg-[#f0fdfa] rounded-xl p-6 border border-teal-200 hover:shadow-md transition"
            >
              <Pill className="w-10 h-10 text-teal-500 mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold">Prescriptions</h3>
              <p className="text-sm text-gray-600 mt-1">
                Doctor-issued medicines
              </p>
            </Link>

            <Link
              to="/patient/reports"
              className="group bg-[#f0fdfa] rounded-xl p-6 border border-teal-200 hover:shadow-md transition"
            >
              <File className="w-10 h-10 text-teal-500 mb-3 group-hover:scale-110 transition" />
              <h3 className="font-semibold">Reports</h3>
              <p className="text-sm text-gray-600 mt-1">
                Lab & diagnostic results
              </p>
            </Link>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleReminder}
              className="flex items-center gap-2 bg-teal-500 text-white px-6 py-3 rounded-full hover:bg-teal-600 transition"
            >
              <CalendarCheck className="w-5 h-5" />
              Set Reminder
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            BMI Calculator
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (feet)
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 5.7"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 65"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            {bmi && (
              <div className="mt-4 p-4 rounded-xl bg-[#f0fdfa] border border-teal-200 text-center">
                <p className="text-lg font-semibold text-gray-800">
                  BMI: {bmi}
                </p>
                <p
                  className={`text-sm font-medium ${
                    bmi < 18.5
                      ? "text-blue-600"
                      : bmi < 25
                      ? "text-green-600"
                      : bmi < 30
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {bmiStatus()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
