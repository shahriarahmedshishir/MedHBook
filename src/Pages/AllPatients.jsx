import { useState, useEffect } from "react";
import { Search, User, FileText, ChevronRight, X } from "lucide-react";
import { useLocation, useNavigate } from 'react-router-dom';

const AllPatients = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location || {};
  const initialPatients = state?.patients || [];
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState(initialPatients);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(initialPatients);
    } else {
      const results = initialPatients.filter(patient =>
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(results);
    }
  }, [searchTerm, initialPatients]);

  const handleBack = () => {
    navigate('/'); // Navigate back to main page
  };

  const handleViewReport = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient } });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#e0f7fa] to-[#b2ebf2] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-teal-600 hover:text-teal-800 mr-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">All Patients</h1>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Search by ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-teal-300 rounded-full px-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm text-gray-700"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-10 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Patient Count */}
        <div className="mb-4 text-right">
          <span className="text-gray-500 text-sm">
            {filteredPatients.length} of {initialPatients.length} patients
          </span>
        </div>

        {/* Patient List */}
        <div className=" p-4 sm:p-6">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No patients found</p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-teal-500 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className=" rounded-lg p-4 flex flex-col gap-2 bg-[#f0fdfa] hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800 truncate">
                      {patient.name}
                    </span>
                    <span className="text-gray-500 text-sm">{patient.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>2 Prescriptions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <FileText className="w-4 h-4" />
                    <span>3 Test Reports</span>
                  </div>
                  <button
                    className="mt-2 bg-teal-500 text-white py-1.5 rounded-full hover:bg-teal-600 transition text-sm"
                    onClick={() => handleViewReport(patient)}
                  >
                    View Reports
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllPatients;