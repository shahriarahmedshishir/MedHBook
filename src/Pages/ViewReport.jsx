import { useState, useEffect } from "react";
import { ChevronRight, Phone, Mail, FileText, Pill, File, FileImage, X } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const ViewReport = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  
  const [patient, setPatient] = useState({
    name: "Rahim Khan",
    phone: "+880-1712-345678",
    email: "rahim@example.com"
  });
  
  const [reports, setReports] = useState([
    {
      id: "R001",
      title: "Cardiology Report",
      files: [
        { id: "F001", name: "ECG_Report.pdf", type: "pdf", url: "https://example.com/ecg-report.pdf" },
        { id: "F002", type: "image", url: "https://i.ibb.co.com/Zz0PYfzt/menu-sweet-item-5-640x640.jpg" }
      ]
    }
  ]);
  
  const [prescriptions, setPrescriptions] = useState([
    {
      id: "PR001",
      title: "Prescription #001",
      files: [
        { id: "PF001", name: "Prescription_001.pdf", type: "pdf", url: "https://example.com/prescription.pdf" }
      ]
    }
  ]);
  
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Simulate fetching patient data
    const mockPatient = {
      "P001": { name: "Rahim Khan", phone: "+880-1712-345678", email: "rahim@example.com" },
      "P002": { name: "Sadia Akter", phone: "+880-1712-345679", email: "sadia@example.com" },
      "P003": { name: "Imran Hossain", phone: "+880-1712-345680", email: "imran@example.com" }
    };
    
    if (patientId) {
      setPatient(mockPatient[patientId] || mockPatient["P001"]);
    }
  }, [patientId]);

  const handleBack = () => {
    navigate(-1);
  };

  const openFile = (file) => {
    setSelectedFile(file);
  };

  const closeViewer = () => {
    setSelectedFile(null);
  };

  const renderFile = (file) => {
    if (file.type === 'image') {
      return (
        <img 
          src={file.url} 
          alt={file.name}
          className="max-w-full max-h-full object-contain"
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
          <div className="text-center">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">{file.name}</p>
            <p className="text-sm text-gray-500 mt-1">PDF File</p>
            <a 
              href={file.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mr-4"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
            <span>Back</span>
          </button>
          <h1 className="text-xl font-semibold">Patient Details</h1>
        </div>

        {/* Patient Info */}
        <div className="bg-[#e4ffff] flex flex-col items-center justify-center rounded-lg shadow p-6 mb-6">
          <h2 className="text-3xl font-extrabold mb-4">{patient.name}</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span>{patient.phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span>{patient.email}</span>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports
          </h3>
          <div className="space-y-3">
            {reports.map(report => (
              <div key={report.id} className=" rounded p-3">
                <h4 className="font-medium mb-2">{report.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {report.files.map(file => (
                    <div 
                      key={file.id} 
                      className="border rounded p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => openFile(file)}
                    >
                      <div className="flex items-center gap-2">
                        {file.type === 'image' ? (
                          <FileImage className="w-4 h-4 text-blue-500" />
                        ) : (
                          <File className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescriptions Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pill className="w-5 h-5" />
            Prescriptions
          </h3>
          <div className="space-y-3">
            {prescriptions.map(prescription => (
              <div key={prescription.id} className=" rounded p-3">
                <h4 className="font-medium mb-2">{prescription.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {prescription.files.map(file => (
                    <div 
                      key={file.id} 
                      className="border rounded p-2 cursor-pointer hover:bg-gray-50"
                      onClick={() => openFile(file)}
                    >
                      <div className="flex items-center gap-2">
                        {file.type === 'image' ? (
                          <FileImage className="w-4 h-4 text-blue-500" />
                        ) : (
                          <File className="w-4 h-4 text-red-500" />
                        )}
                        <span className="text-sm truncate">{file.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full relative">
            <button
              onClick={closeViewer}
              className="absolute top-4 right-4 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-4 h-[calc(90vh-60px)] overflow-auto">
              <h3 className="text-lg font-semibold mb-4">{selectedFile.name}</h3>
              <div className="h-[calc(100%-3rem)] flex items-center justify-center">
                {renderFile(selectedFile)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewReport;