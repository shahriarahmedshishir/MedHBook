import { useEffect, useState, useContext } from "react";
import { FileText } from "lucide-react";
import { authGet, authDelete } from "../utils/api";
import AuthContext from "../Components/Context/AuthContext";
import PrescriptionCard from "../Components/Shared/PrescriptionCard";

const DigitalPrescriptions = () => {
  // Handler for updating digital prescription
  const handleUpdateDigitalPrescription = (prescriptionId) => {
    // Redirect to update page
    window.location.href = `/update-prescription?id=${prescriptionId}`;
  };
  const [digitalPrescriptions, setDigitalPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user?.email) return;
    const fetchDigitalPrescriptions = async () => {
      setLoading(true);
      try {
        const res = await authGet(
          `/digital-prescriptions?email=${encodeURIComponent(user.email)}`,
        );
        if (!res.ok) throw new Error("Failed to fetch digital prescriptions");
        const data = await res.json();
        setDigitalPrescriptions(
          data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        );
      } catch (err) {
        alert("Error fetching digital prescriptions: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDigitalPrescriptions();
  }, [user]);

  // Handler for downloading digital prescription as PDF
  const handleDownloadDigitalPrescriptionPDF = async (prescription) => {
    try {
      // Render a full PrescriptionCard in a hidden div for PDF export
      const tempDiv = document.createElement("div");
      tempDiv.style.position = "fixed";
      tempDiv.style.left = "-9999px";
      tempDiv.style.top = "0";
      tempDiv.style.background = "#fff";
      document.body.appendChild(tempDiv);
      // Create a React root and render PrescriptionCard (not compact)
      const root = document.createElement("div");
      tempDiv.appendChild(root);
      // Dynamically import ReactDOM to render
      const React = (await import("react")).default;
      const ReactDOM = (await import("react-dom/client")).createRoot;
      const PrescriptionCard = (
        await import("../Components/Shared/PrescriptionCard")
      ).default;
      const card = React.createElement(PrescriptionCard, {
        doctorInfo: {
          doctorName: prescription.doctorName,
          doctorSpecialty: prescription.doctorSpecialty,
          chamber: prescription.chamber,
          phone: prescription.chamberPhone,
        },
        patient: {
          name: prescription.patientName || "",
          uid: prescription.patientUid || "",
        },
        medicines: prescription.medicines,
        createdAt: prescription.createdAt,
        showSignature: true,
        showFooter: true,
        inlineStyles: true,
        compact: false,
      });
      const reactRoot = ReactDOM(root);
      reactRoot.render(card);
      // Wait for DOM to update
      await new Promise((resolve) => setTimeout(resolve, 300));
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;
      const canvas = await html2canvas(root.firstChild, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: root.firstChild.scrollWidth,
        windowHeight: root.firstChild.scrollHeight,
      });
      document.body.removeChild(tempDiv);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const fileName = `Prescription_${prescription.doctorName}_${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);
      alert("PDF downloaded successfully!");
    } catch (error) {
      alert(`Failed to download prescription: ${error.message}`);
    }
  };

  // Handler for deleting digital prescription
  const handleDeleteDigitalPrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }
    try {
      const response = await authDelete(
        `/digital-prescriptions/${prescriptionId}`,
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to delete prescription",
        );
      }
      setDigitalPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescriptionId),
      );
      alert("Prescription deleted successfully");
    } catch (error) {
      alert("Failed to delete prescription: " + error.message);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-[#304d5d]">
        <FileText className="w-7 h-7 text-[#67cffe]" /> Digital Prescriptions
      </h2>
      {loading ? (
        <div className="text-center py-12 text-lg">Loading...</div>
      ) : digitalPrescriptions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No digital prescriptions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {digitalPrescriptions.map((item) => (
            <div
              key={item._id}
              className="rounded-2xl shadow-md p-4 w-64 hover:shadow-xl transition flex flex-col items-center"
            >
              <div
                style={{
                  width: "100%",
                  height: "180px",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                data-prescription-id={item._id}
              >
                <PrescriptionCard
                  doctorInfo={{
                    doctorName: item.doctorName,
                    doctorSpecialty: item.doctorSpecialty,
                    chamber: item.chamber,
                    phone: item.chamberPhone,
                  }}
                  patient={{
                    name: item.patientName || "",
                    uid: item.patientUid || "",
                  }}
                  medicines={item.medicines}
                  createdAt={item.createdAt}
                  compact={true}
                />
              </div>
              {/* Action Buttons */}
              <div className="mt-2 flex justify-end gap-2 w-full">
                {user?.role === "doctor" && (
                  <button
                    onClick={() => handleUpdateDigitalPrescription(item._id)}
                    className="flex items-center gap-2 px-3 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm"
                  >
                    Update
                  </button>
                )}
                {user?.role === "user" && (
                  <>
                    <button
                      onClick={() => handleDownloadDigitalPrescriptionPDF(item)}
                      className="flex items-center gap-2 px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleDeleteDigitalPrescription(item._id)}
                      className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                    >
                      Delete
                    </button>
                  </>
                )}
                {/* Admin sees nothing */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DigitalPrescriptions;
