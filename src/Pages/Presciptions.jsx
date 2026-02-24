// (Stray code removed)
import { useContext, useRef, useState, useEffect } from "react";
import { Upload, Trash2, Download, FileText } from "lucide-react";
import PrescriptionCard from "../Components/Shared/PrescriptionCard";
import AuthContext from "../Components/Context/AuthContext";
import { serverURL } from "../config";
import { authGet } from "../utils/api";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Prescription = () => {
  // Download digital prescription as PDF (hides action buttons)
  const downloadDigitalPrescriptionPDF = async (prescription) => {
    console.log("Starting PDF download for prescription:", prescription._id);
    setDownloading(prescription._id);

    function stripClassNames(element) {
      if (element.removeAttribute) element.removeAttribute("class");
      Array.from(element.children).forEach(stripClassNames);
    }

    try {
      const prescriptionElement = document.getElementById(
        `digital-prescription-${prescription._id}`,
      );

      if (!prescriptionElement) {
        alert("Prescription element not found. Please try again.");
        setDownloading(null);
        return;
      }

      // Hide action buttons
      const actionDiv = prescriptionElement.querySelector(
        'div[style*="justify-content: flex-end"], .flex.justify-end',
      );
      let prevDisplay = null;
      if (actionDiv) {
        prevDisplay = actionDiv.style.display;
        actionDiv.style.display = "none";
      }

      // Clone and strip all classNames
      const clone = prescriptionElement.cloneNode(true);
      stripClassNames(clone);

      // Render in a hidden, style-free container
      const hiddenDiv = document.createElement("div");
      hiddenDiv.style.position = "fixed";
      hiddenDiv.style.left = "-9999px";
      hiddenDiv.style.top = "0";
      hiddenDiv.style.background = "#fff";
      hiddenDiv.appendChild(clone);
      document.body.appendChild(hiddenDiv);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      // Remove hidden container
      document.body.removeChild(hiddenDiv);

      // Restore action buttons
      if (actionDiv) actionDiv.style.display = prevDisplay;

      // Download as PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      const fileName = `Prescription_${prescription.doctorName}_${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g, "-")}.pdf`;
      pdf.save(fileName);

      console.log("PDF downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(`Failed to download prescription: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [digitalPrescriptions, setDigitalPrescriptions] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const prescriptionInputRef = useRef(null);

  // Fetch UID
  useEffect(() => {
    if (!user?.email) return;
    const fetchUserUid = async () => {
      try {
        const res = await fetch(`${serverURL}/user`);
        const allUsers = await res.json();
        const matchedUser = allUsers.find((u) => u.email === user.email);
        if (matchedUser?.uid) setUserUid(matchedUser.uid);
      } catch (err) {
        console.error("Error fetching UID:", err);
      }
    };
    fetchUserUid();
  }, [user]);

  // File selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveSelectedFile = (name) =>
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));

  const toggleSelectForDelete = (id) => {
    setSelectedForDelete((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    selectedForDelete.forEach((id) => handleRemoveStoredFile(id));
  };

  const handleRemoveStoredFile = async (id) => {
    try {
      const prescriptionElement = document.getElementById(
        `digital-prescription-${prescription._id}`,
      );

      if (!prescriptionElement) {
        console.error(
          "Prescription element not found with ID:",
          `digital-prescription-${prescription._id}`,
        );
        alert("Prescription element not found. Please try again.");
        setDownloading(null);
        return;
      }

      // Clone and strip all classNames
      const clone = prescriptionElement.cloneNode(true);
      stripClassNames(clone);

      // Render in a hidden, style-free container
      const hiddenDiv = document.createElement("div");
      hiddenDiv.style.position = "fixed";
      hiddenDiv.style.left = "-9999px";
      hiddenDiv.style.top = "0";
      hiddenDiv.style.background = "#fff";
      hiddenDiv.appendChild(clone);
      document.body.appendChild(hiddenDiv);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      // Remove hidden container
      document.body.removeChild(hiddenDiv);

      // Download as PNG
      const imgData = canvas.toDataURL("image/png");
      const fileName = `Prescription_${prescription.doctorName}_${new Date(prescription.createdAt).toLocaleDateString().replace(/\//g, "-")}.png`;
      const link = document.createElement("a");
      link.href = imgData;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("PNG downloaded successfully!");
    } catch (error) {
      console.error("Error generating PNG:", error);
      console.error("Error stack:", error.stack);
      alert(`Failed to download prescription: ${error.message}`);
    } finally {
      setDownloading(null);
    }
  };

  // Delete digital prescription
  const deleteDigitalPrescription = async (prescriptionId) => {
    if (!window.confirm("Are you sure you want to delete this prescription?")) {
      return;
    }

    try {
      const token = localStorage.getItem("authToken");
      console.log("Deleting digital prescription with ID:", prescriptionId);
      console.log("Token exists:", !!token);

      const response = await fetch(
        `${serverURL}/digital-prescriptions/${prescriptionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Delete response status:", response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }));
        console.error("Delete failed with:", errorData);
        throw new Error(
          errorData.message ||
            errorData.error ||
            "Failed to delete prescription",
        );
      }

      // Remove from state
      setDigitalPrescriptions((prev) =>
        prev.filter((p) => p._id !== prescriptionId),
      );
      alert("Prescription deleted successfully");
    } catch (error) {
      console.error("Full error:", error);
      alert("Failed to delete prescription: " + error.message);
    }
  };

  // Upload
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) return alert("Enter doctor's name");
    if (!user?.email) return alert("User info missing");
    if (!userUid) return alert("User UID not loaded yet. Please wait.");
    if (!selectedFiles.length) return alert("Select at least one file");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("doctorName", doctorName);
    formData.append("uid", userUid);
    selectedFiles.forEach((file) => formData.append("files", file));

    setUploading(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${serverURL}/prescriptions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setPrescriptions((prev) => [...result.data, ...prev]);
      setSelectedFiles([]);
      setDoctorName("");
      alert("Prescription(s) uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading prescriptions: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Fetch prescriptions
  useEffect(() => {
    if (!user?.email) return;
    const fetchPrescriptions = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(
          `${serverURL}/prescriptions?email=${encodeURIComponent(user.email)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const data = await res.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPrescriptions([]);
      }
    };
    fetchPrescriptions();
  }, [user]);

  // Fetch digital prescriptions
  useEffect(() => {
    if (!user?.email) return;
    const fetchDigitalPrescriptions = async () => {
      try {
        const response = await authGet(
          `/digital-prescriptions?email=${encodeURIComponent(user.email)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setDigitalPrescriptions(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Error fetching digital prescriptions:", err);
        setDigitalPrescriptions([]);
      }
    };
    fetchDigitalPrescriptions();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Prescriptions</h1>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Doctor Name"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              disabled={uploading}
            />
            <input
              type="file"
              multiple
              ref={prescriptionInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
              onClick={() => prescriptionInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-3 text-teal-400" />
              <p>Click to upload or drag and drop</p>
            </div>

            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {selectedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-md"
                  >
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSelectedFile(file.name)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={
                uploading ||
                !doctorName.trim() ||
                selectedFiles.length === 0 ||
                !userUid
              }
              className="bg-teal-500 text-white px-6 py-2 rounded-full"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>

        {/* Display Prescriptions */}
        {/* Digital Prescriptions Section */}
        {digitalPrescriptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-teal-600" />
              Digital Prescriptions
            </h2>
            <div className="space-y-4">
              {digitalPrescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  id={`digital-prescription-${prescription._id}`}
                >
                  <PrescriptionCard
                    doctorInfo={{
                      doctorName: prescription.doctorName,
                      doctorSpecialty: prescription.doctorSpecialty,
                      chamber: prescription.chamber,
                      phone: prescription.chamberPhone,
                    }}
                    patient={{
                      name: prescription.patientName || "",
                      uid: prescription.patientUid || "",
                    }}
                    medicines={prescription.medicines}
                    createdAt={prescription.createdAt}
                    showSignature={true}
                    showFooter={true}
                    inlineStyles={true}
                  />
                  {/* Action Buttons */}
                  <div className="mt-4 pt-4 border-t flex justify-end gap-3">
                    <button
                      onClick={() =>
                        deleteDigitalPrescription(prescription._id)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() =>
                        downloadDigitalPrescriptionPDF(prescription)
                      }
                      disabled={downloading === prescription._id}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      {downloading === prescription._id
                        ? "Downloading..."
                        : "Download PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Prescription Images */}
        <h2 className="text-2xl font-bold mb-4">Uploaded Prescriptions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prescriptions.length === 0 ? (
            <p>No prescriptions uploaded yet.</p>
          ) : (
            prescriptions.map((report) => (
              <div
                key={report._id}
                className="relative bg-white rounded-xl shadow p-4 flex flex-col"
              >
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="absolute top-2 left-2 w-5 h-5"
                  checked={selectedForDelete.includes(report._id)}
                  onChange={() => toggleSelectForDelete(report._id)}
                />

                {report.img && (
                  <img
                    src={`${serverURL}${report.img}`}
                    alt={report.doctorName}
                    className="h-48 w-full object-cover rounded-md mb-3 cursor-pointer"
                    onClick={() => setModalImg(`${serverURL}${report.img}`)}
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">
                  Dr. {report.doctorName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sticky Action Buttons */}
      {selectedForDelete.length > 0 && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleDeleteSelected}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg w-48 text-center transition-all"
          >
            Delete Selected ({selectedForDelete.length})
          </button>

          <button
            onClick={handleDownloadSelected}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-3 rounded-full shadow-lg w-48 text-center transition-all"
          >
            Download Selected
          </button>
        </div>
      )}

      {/* Full Image Modal */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImg}
              alt="Full view"
              className="max-h-[90vh] max-w-[90vw] rounded-md"
            />
            <button
              className="absolute top-2 right-2 text-white bg-gray-800 bg-opacity-60 hover:bg-opacity-80 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold"
              onClick={() => setModalImg(null)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Prescription;
