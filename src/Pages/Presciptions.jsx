import { useContext, useRef, useState, useEffect } from "react";
import { Upload, Trash2 } from "lucide-react";
import AuthContext from "../Components/Context/AuthContext";
import { serverURL } from "../config";

const Prescriptions = () => {
  const { user } = useContext(AuthContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [doctorName, setDoctorName] = useState("");
  const [uploading, setUploading] = useState(false);
  const prescriptionInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [modalImg, setModalImg] = useState(null);
  const [userUid, setUserUid] = useState(null);

  // ✅ Fetch UID for logged-in user
  useEffect(() => {
    const fetchUserUid = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`${serverURL}/user`);
        const allUsers = await res.json();
        const matchedUser = allUsers.find((u) => u.email === user.email);
        if (matchedUser?.uid) {
          setUserUid(matchedUser.uid);
          console.log("✅ Found user UID:", matchedUser.uid);
        } else {
          console.warn("⚠️ UID not found for user", user.email);
        }
      } catch (err) {
        console.error("Error fetching UID:", err);
      }
    };
    fetchUserUid();
  }, [user]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setSelectedFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveSelectedFile = (name) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleRemoveStoredFile = async (id) => {
    try {
      const res = await fetch(`${serverURL}/prescriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete prescription");
      setPrescriptions((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting prescription: " + err.message);
    }
  };

  // ✅ Upload prescription (includes UID)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName.trim()) return alert("Enter doctor's name");
    if (!user?.email) return alert("User info missing");
    if (!userUid)
      return alert("User UID not loaded yet. Please wait a second.");
    if (selectedFiles.length === 0) return alert("Select at least one file");

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("doctorName", doctorName);
    formData.append("uid", userUid);
    selectedFiles.forEach((file) => formData.append("files", file));

    console.log("📦 Uploading prescription:", {
      email: user.email,
      doctorName,
      uid: userUid,
      files: selectedFiles.map((f) => f.name),
    });

    setUploading(true);
    try {
      const res = await fetch(`${serverURL}/prescriptions`, {
        method: "POST",
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

  // ✅ Fetch prescriptions
  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(
          `${serverURL}/prescriptions?email=${encodeURIComponent(user.email)}`
        );
        if (!res.ok) throw new Error("Failed to fetch prescriptions");
        const data = await res.json();
        setPrescriptions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setPrescriptions([]);
      }
    };
    fetchPrescriptions();
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
              {uploading
                ? "Uploading..."
                : userUid
                ? "Upload"
                : "Loading UID..."}
            </button>
          </form>
        </div>

        {/* Display Prescriptions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {prescriptions.length === 0 ? (
            <p>No prescriptions uploaded yet.</p>
          ) : (
            prescriptions.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl shadow p-4 flex flex-col"
              >
                {p.img && (
                  <img
                    src={`${serverURL}${p.img}`}
                    alt={p.doctorName}
                    className="h-48 w-full object-cover rounded-md mb-3 cursor-pointer"
                    onClick={() => setModalImg(`${serverURL}${p.img}`)}
                  />
                )}
                <h3 className="text-lg font-semibold mb-2">
                  Dr. {p.doctorName}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  {new Date(p.createdAt).toLocaleString()}
                </p>
                <button
                  onClick={() => handleRemoveStoredFile(p._id)}
                  className="mt-auto bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Image Modal */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <img
            src={modalImg}
            alt="Full view"
            className="max-h-[90%] max-w-[90%] rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default Prescriptions;
