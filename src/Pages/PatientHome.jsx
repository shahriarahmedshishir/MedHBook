import { useState } from "react";
import { Upload, FileText, CalendarCheck, Trash2 } from "lucide-react";

const PatientHome = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [testReports, setTestReports] = useState([]);

  const handleFileChange = (setter) => (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setter((prev) => [...prev, ...files]);
    }
    e.target.value = ""; // Reset input to allow re-upload of same files
  };

  const handleRemoveFile = (type, index) => {
    if (type === "prescription") {
      setPrescriptions((prev) => prev.filter((_, i) => i !== index));
    } else {
      setTestReports((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleReminder = () => {
    alert("Reminder feature coming soon!");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (prescriptions.length === 0 && testReports.length === 0) {
      alert("Please upload at least one file.");
      return;
    }

    console.log("Prescriptions:", prescriptions);
    console.log("Test Reports:", testReports);
    alert("Files uploaded successfully!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-2 text-center md:text-left">
          Patient Dashboard
        </h1>
        <p className="text-gray-600 mb-10 text-center md:text-left">
          Upload your prescriptions and test reports below. You can upload multiple files and manage them easily.
        </p>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Prescription Upload */}
            <div className="flex flex-col items-center bg-[#f0fdfa] rounded-xl p-4">
              <FileText className="w-12 h-12 text-teal-500 mb-2" />
              <h2 className="text-lg font-semibold mb-2">Upload Prescription</h2>
              <input
                type="file"
                multiple
                onChange={handleFileChange(setPrescriptions)}
                accept=".pdf,.jpg,.png"
                className="mb-3"
              />
              <div className="space-y-1 w-full">
                {prescriptions.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm"
                  >
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("prescription", idx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Test Report Upload */}
            <div className="flex flex-col items-center bg-[#f0fdfa] rounded-xl p-4">
              <FileText className="w-12 h-12 text-teal-500 mb-2" />
              <h2 className="text-lg font-semibold mb-2">Upload Test Report</h2>
              <input
                type="file"
                multiple
                onChange={handleFileChange(setTestReports)}
                accept=".pdf,.jpg,.png"
                className="mb-3"
              />
              <div className="space-y-1 w-full">
                {testReports.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm"
                  >
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("testReport", idx)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reminder & Submit */}
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-4">
            <button
              type="button"
              onClick={handleReminder}
              className="flex items-center justify-center bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition font-medium gap-2"
            >
              <CalendarCheck className="w-5 h-5" /> Set Reminder
            </button>

            <button
              type="submit"
              className="flex items-center justify-center bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition font-medium gap-2"
            >
              <Upload className="w-5 h-5" /> Upload Files
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientHome;
