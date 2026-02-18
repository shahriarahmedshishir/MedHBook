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
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-6 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute top-20 right-10 w-96 h-96 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="max-w-6xl mx-auto text-center mb-12 relative z-10 animate-fadeIn">
        <Logo />
        <p className="mt-4 text-lg font-semibold text-[#304d5d] tracking-wide">
          Your Health. Your Records. One Book.
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 animate-slideInLeft">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
            Medical Records
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/patient/xrays"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-6 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1"
            >
              <Activity className="w-12 h-12 text-[#67cffe] mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d]">X-Rays</h3>
              <p className="text-sm text-gray-600 mt-2">
                View and download scans
              </p>
            </Link>

            <Link
              to="/patient/prescriptions"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-6 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1"
            >
              <Pill className="w-12 h-12 text-[#67cffe] mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d]">Prescriptions</h3>
              <p className="text-sm text-gray-600 mt-2">
                Doctor-issued medicines
              </p>
            </Link>

            <Link
              to="/patient/reports"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-6 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1"
            >
              <File className="w-12 h-12 text-[#67cffe] mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d]">Reports</h3>
              <p className="text-sm text-gray-600 mt-2">
                Lab & diagnostic results
              </p>
            </Link>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleReminder}
              className="flex items-center gap-3 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white px-8 py-3.5 rounded-full hover:shadow-xl hover:shadow-[#67cffe]/30 transition-all duration-300 hover:-translate-y-0.5 font-semibold"
            >
              <CalendarCheck className="w-5 h-5" />
              Set Reminder
            </button>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-white/20 animate-slideInRight">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
            BMI Calculator
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#304d5d] mb-2">
                Height (feet)
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 5.7"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 transition-all duration-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#304d5d] mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 65"
                className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 transition-all duration-300 bg-white"
              />
            </div>

            {bmi && (
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-[#67cffe]/10 to-[#304d5d]/5 border-2 border-[#67cffe]/30 text-center animate-scaleIn">
                <p className="text-2xl font-bold text-[#304d5d]">BMI: {bmi}</p>
                <p
                  className={`text-sm font-semibold mt-2 px-4 py-2 rounded-full inline-block ${
                    bmi < 18.5
                      ? "bg-blue-100 text-blue-700"
                      : bmi < 25
                      ? "bg-green-100 text-green-700"
                      : bmi < 30
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
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
