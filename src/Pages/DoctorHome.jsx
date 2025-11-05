import { useState } from "react";
import { Search, User, FileText } from "lucide-react";

const DoctorHome = () => {
  const [searchId, setSearchId] = useState("");
  const [patients, setPatients] = useState([
    { id: "P001", name: "Rahim Khan" },
    { id: "P002", name: "Sadia Akter" },
    { id: "P003", name: "Imran Hossain" },
  ]);

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for Patient ID: ${searchId}`);
    // Integrate backend search here
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#e0f7fa] to-[#b2ebf2] p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Doctor Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row md:items-center gap-6">
          <User className="w-16 h-16 text-teal-500" />
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Dr. Ahsan Rahman
            </h2>
            <p className="text-gray-600">
              Cardiologist | Medical License #12345
            </p>
            <p className="text-gray-500 text-sm mt-1">Experience: 10 years</p>
          </div>
        </div>

        {/* Patient ID Search */}
        <form onSubmit={handleSearch} className="w-full md:w-1/2 relative">
          {/* Search Icon */}
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </span>

          {/* Input Field */}
          <input
            type="text"
            placeholder="Enter Patient ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full border border-teal-300 rounded-full px-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm text-gray-700"
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition font-medium shadow-md flex items-center gap-2"
          >
            Search
          </button>
        </form>

        {/* Patient List */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Patient List
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="border rounded-lg p-4 flex flex-col gap-2 bg-[#f0fdfa] hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">
                    {patient.name}
                  </span>
                  <span className="text-gray-500 text-sm">{patient.id}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span>2 Prescriptions</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText className="w-5 h-5" />
                  <span>3 Test Reports</span>
                </div>
                <button
                  className="mt-2 bg-teal-500 text-white py-1.5 rounded-full hover:bg-teal-600 transition text-sm"
                  onClick={() => alert(`Viewing reports for ${patient.name}`)}
                >
                  View Reports
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;
