import { useState } from "react";
import { Search, User, FileText, ChevronRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const DoctorHome = () => {
  const [searchId, setSearchId] = useState("");
  const navigate = useNavigate();
  const [patients] = useState([
    { id: "P001", name: "Rahim Khan" },
    { id: "P002", name: "Sadia Akter" },
    { id: "P003", name: "Imran Hossain" },
    { id: "P004", name: "Fatima Ahmed" },
    { id: "P005", name: "Kamal Uddin" },
    { id: "P006", name: "Nusrat Jahan" },
    { id: "P007", name: "Tasnim Haque" },
    { id: "P008", name: "Arif Hassan" },
    { id: "P009", name: "Sumaiya Rahman" },
    { id: "P100", name: "Masud Rana" },
  ]);

  // State to store filtered patients
  const [filteredPatients, setFilteredPatients] = useState(patients);

  // Handle search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      // If search is empty, show all patients
      setFilteredPatients(patients);
    } else {
      // Filter patients based on ID
      const results = patients.filter(patient => 
        patient.id.toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredPatients(results);
    }
  };

  // Navigate to all patients page
  const handleShowAll = () => {
    setSearchId("");
    // Navigate to all patients page with patients data
    navigate('/all-patients', { state: { patients } });
  };

  // Navigate to view report page
  const handleViewReport = (patient) => {
    navigate(`/patient/${patient.id}`, { state: { patient } });
  };

  // Show only first 6 patients by default
  const displayedPatients = filteredPatients.slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4 sm:p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* Doctor Information */}
        <div className="bg-[#cbffff] rounded-2xl shadow-lg p-4 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
          <User className="w-12 h-12 sm:w-16 sm:h-16 text-teal-500" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Dr. Ahsan Rahman
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Cardiologist | Medical License #12345
            </p>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Experience: 10 years</p>
          </div>
        </div>

        {/* Patient ID Search */}
        <form onSubmit={handleSearch} className="w-full max-w-md mx-auto">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              placeholder="Enter Patient ID"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              className="w-full border border-teal-300 rounded-full px-12 py-3 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 shadow-sm text-gray-700"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-teal-500 text-white px-4 sm:px-6 py-2 rounded-full hover:bg-teal-600 transition font-medium shadow-md"
            >
              Search
            </button>
          </div>
        </form>

        {/* Patient List */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Patient List
            </h2>
            <span className="text-gray-500 text-sm">
              {filteredPatients.length} of {patients.length} patients
            </span>
          </div>
          
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No patients found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPatients.map((patient) => (
                <div
                  key={patient.id}
                  className=" rounded-lg p-4 flex flex-col gap-2 bg-[#f0fdfa] hover:shadow-lg transition"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">
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
          
          {/* Show All Patients Button */}
          {filteredPatients.length > 6 && (
            <div className="w-full flex items-center justify-center mt-6">
              <button
                className="flex items-center justify-center gap-2 mt-4 w-40 bg-[#5dd5e7] text-black py-1.5 rounded-full transition"
                onClick={handleShowAll}
              >
                All Patients
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorHome;