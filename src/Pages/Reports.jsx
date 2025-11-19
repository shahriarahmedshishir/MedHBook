import { useContext, useRef, useState, useEffect } from "react";
import { Upload, Trash2, Download } from "lucide-react";
import AuthContext from "../Components/Context/AuthContext";
import { serverURL } from "../config";

const Reports = () => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [selectedForDelete, setSelectedForDelete] = useState([]);
  const reportInputRef = useRef(null);

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
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    selectedForDelete.forEach((id) => handleRemoveStoredFile(id));
  };

  const handleRemoveStoredFile = async (id) => {
    try {
      const res = await fetch(`${serverURL}/reports/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete report");
      setReports((prev) => prev.filter((f) => f._id !== id));
      setSelectedForDelete((prev) => prev.filter((x) => x !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting report: " + err.message);
    }
  };

  // Download selected
  const handleDownloadSelected = async () => {
    for (const id of selectedForDelete) {
      const item = reports.find((r) => r._id === id);
      if (!item || !item.img) continue;

      const imageUrl = `${serverURL}${item.img}`;
      const fileName = `Report_${item.doctorName || "Unknown"}.jpg`;

      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download error:", error);
      }
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
      const res = await fetch(`${serverURL}/reports`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setReports((prev) => [...result.data, ...prev]);
      setSelectedFiles([]);
      setDoctorName("");
      alert("Report(s) uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Error uploading reports: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  // Fetch reports
  useEffect(() => {
    if (!user?.email) return;
    const fetchReports = async () => {
      try {
        const res = await fetch(
          `${serverURL}/reports?email=${encodeURIComponent(user.email)}`
        );
        const data = await res.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setReports([]);
      }
    };
    fetchReports();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Reports</h1>

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
              ref={reportInputRef}
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer"
              onClick={() => reportInputRef.current?.click()}
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

        {/* Display Reports */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reports.length === 0 ? (
            <p>No reports uploaded yet.</p>
          ) : (
            reports.map((report) => (
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

export default Reports;
