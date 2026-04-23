import {
  CalendarCheck,
  File,
  Pill,
  Activity,
  GraduationCap,
} from "lucide-react";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import Logo from "../Components/Shared/Logo";
import AuthContext from "../Components/Context/AuthContext";
import { authGet } from "../utils/api";

const PatientHome = () => {
  const { user } = useContext(AuthContext);
  const handleReminder = () => alert("Reminder feature coming soon!");

  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [counts, setCounts] = useState({
    xrays: 0,
    digitalPrescriptions: 0,
    prescriptions: 0,
    reports: 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

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

  // Fetch counts for each section
  useEffect(() => {
    const fetchCounts = async () => {
      if (!user?.email) return;

      try {
        setLoadingCounts(true);

        // Fetch all counts in parallel
        const [xraysRes, digitalPresRes, presRes, reportsRes] =
          await Promise.all([
            authGet(`/xrays/${user.email}`),
            authGet(
              `/digital-prescriptions?email=${encodeURIComponent(user.email)}`,
            ),
            authGet(`/prescriptions/${user.email}`),
            authGet(`/reports/${user.email}`),
          ]);

        const xraysData = await xraysRes.json();
        const digitalPresData = await digitalPresRes.json();
        const presData = await presRes.json();
        const reportsData = await reportsRes.json();

        setCounts({
          xrays: Array.isArray(xraysData) ? xraysData.length : 0,
          digitalPrescriptions: Array.isArray(digitalPresData)
            ? digitalPresData.length
            : 0,
          prescriptions: Array.isArray(presData) ? presData.length : 0,
          reports: Array.isArray(reportsData) ? reportsData.length : 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        // Set defaults on error
        setCounts({
          xrays: 0,
          digitalPrescriptions: 0,
          prescriptions: 0,
          reports: 0,
        });
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchCounts();
  }, [user?.email]);

  return (
    <div className="h-[calc(100vh-7rem)]  bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-4 relative overflow-hidden flex flex-col">
      {/* Animated background blobs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-[#67cffe] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
      <div
        className="absolute bottom-10 left-10 w-64 h-64 bg-[#304d5d] rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"
        style={{ animationDelay: "2s" }}
      ></div>

      {/* Header */}
      <div className="max-w-6xl w-full mx-auto text-center mb-4 relative z-10 animate-fadeIn">
        <Logo />
        <p className="mt-1 text-sm font-semibold text-[#304d5d] tracking-wide">
          Your Health. Your Records. One Book.
        </p>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-10 flex-1 min-h-0">
        {/* Medical Records */}
        <div className="lg:col-span-2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-5 h-110 border border-white/20 animate-slideInLeft flex flex-col">
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
            Medical Records
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              to="/patient/xrays"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-3 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start relative"
            >
              <Activity className="w-7 h-7 text-[#67cffe] mb-2 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d] text-sm">X-Rays</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                View and download scans
              </p>
              {!loadingCounts && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {counts.xrays}
                </span>
              )}
            </Link>

            <Link
              to="/patient/digital-prescriptions"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-3 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start relative"
            >
              <FileText className="w-7 h-7 text-[#67cffe] mb-2 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d] text-sm">
                Digital Prescriptions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                Download and view prescriptions
              </p>
              {!loadingCounts && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {counts.digitalPrescriptions}
                </span>
              )}
            </Link>

            <Link
              to="/patient/prescriptions"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-3 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start relative"
            >
              <Pill className="w-7 h-7 text-[#67cffe] mb-2 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d] text-sm">
                Prescriptions
              </h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                Doctor-issued medicines
              </p>
              {!loadingCounts && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {counts.prescriptions}
                </span>
              )}
            </Link>

            <Link
              to="/patient/reports"
              className="group bg-gradient-to-br from-white to-[#67cffe]/5 rounded-xl p-3 border-2 border-[#67cffe]/20 hover:border-[#67cffe] hover:shadow-xl hover:shadow-[#67cffe]/20 transition-all duration-300 hover:-translate-y-1 flex flex-col items-start relative"
            >
              <File className="w-7 h-7 text-[#67cffe] mb-2 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="font-bold text-[#304d5d] text-sm">Reports</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                Lab & diagnostic results
              </p>
              {!loadingCounts && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {counts.reports}
                </span>
              )}
            </Link>
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={handleReminder}
              className="flex items-center gap-2 bg-gradient-to-r from-[#304d5d] to-[#67cffe] text-white px-6 py-2.5 rounded-full hover:shadow-xl hover:shadow-[#67cffe]/30 transition-all duration-300 hover:-translate-y-0.5 font-semibold text-sm"
            >
              <CalendarCheck className="w-4 h-4" />
              Set Reminder
            </button>
          </div>
        </div>

        {/* BMI Calculator */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-5 border h-110 border-white/20 animate-slideInRight flex flex-col">
          <h2 className="text-lg font-bold mb-4 bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
            BMI Calculator
          </h2>

          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-xs font-semibold text-[#304d5d] mb-1">
                Height (feet)
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 5.7"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 transition-all duration-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#304d5d] mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 65"
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-[#67cffe] focus:shadow-lg focus:shadow-[#67cffe]/20 transition-all duration-300 bg-white"
              />
            </div>

            {bmi && (
              <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-[#67cffe]/10 to-[#304d5d]/5 border-2 border-[#67cffe]/30 text-center animate-scaleIn">
                <p className="text-xl font-bold text-[#304d5d]">BMI: {bmi}</p>
                <p
                  className={`text-xs font-semibold mt-2 px-3 py-1.5 rounded-full inline-block ${
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

      {/* Floating Apply as Doctor Button */}
      <Link
        to="/apply-doctor"
        className="fixed top-24 right-6 bg-linear-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm shadow-2xl border border-white/20 hover:shadow-2xl hover:scale-110 transition-all duration-300 z-20 flex items-center gap-2 animate-slideInFromLeft"
      >
        <GraduationCap className="w-5 h-5" />
        <span>Apply as Doctor</span>
      </Link>
    </div>
  );
};

export default PatientHome;
