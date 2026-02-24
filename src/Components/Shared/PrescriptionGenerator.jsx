import { useState, useContext, useRef, useEffect } from "react";
import PrescriptionCard from "./PrescriptionCard";
import { X, Plus, FileText } from "lucide-react";
import AuthContext from "../Context/AuthContext";
import { authPost, authGet } from "../../utils/api";

const PrescriptionGenerator = ({ patient, onClose }) => {
  const { user } = useContext(AuthContext);
  const prescriptionRef = useRef();

  const [doctorProfile, setDoctorProfile] = useState(null);
  const [selectedChamber, setSelectedChamber] = useState(null);
  const [doctorInfo, setDoctorInfo] = useState({
    name: user?.name || "",
    specialty: "",
    chamber: "",
    phone: "",
  });

  const [medicines, setMedicines] = useState([
    {
      id: 1,
      name: "",
      duration: "",
      morning: false,
      afternoon: false,
      evening: false,
    },
  ]);

  const [loading, setLoading] = useState(false);

  // Fetch doctor profile on mount
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      try {
        const response = await authGet(`/doctor/${user.email}`);
        if (response.ok) {
          const data = await response.json();
          setDoctorProfile(data);

          // Auto-populate specialty
          setDoctorInfo((prev) => ({
            ...prev,
            specialty: data?.specialization || data?.specialty || "",
          }));

          // Auto-select first chamber if available
          if (data?.chambers && data.chambers.length > 0) {
            const firstChamber = data.chambers[0];
            setSelectedChamber(firstChamber);
            setDoctorInfo((prev) => ({
              ...prev,
              chamber: firstChamber.name || "",
              phone: firstChamber.phone || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      }
    };

    if (user?.email) {
      fetchDoctorProfile();
    }
  }, [user?.email]);

  // Update chamber info when selection changes
  const handleChamberChange = (e) => {
    const chamberName = e.target.value;
    const chamber = doctorProfile?.chambers?.find(
      (c) => c.name === chamberName,
    );
    if (chamber) {
      setSelectedChamber(chamber);
      setDoctorInfo((prev) => ({
        ...prev,
        chamber: chamber.name || "",
        phone: chamber.phone || "",
      }));
    }
  };

  const addMedicine = () => {
    setMedicines([
      ...medicines,
      {
        id: Date.now(),
        name: "",
        duration: "",
        morning: false,
        afternoon: false,
        evening: false,
      },
    ]);
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter((m) => m.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(
      medicines.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const submitPrescription = async () => {
    setLoading(true);
    try {
      // Validate medicines
      const validMedicines = medicines.filter(
        (m) => m.name && m.name.trim() !== "",
      );

      if (validMedicines.length === 0) {
        alert("Please add at least one medicine with a name");
        setLoading(false);
        return;
      }

      // Save the prescription to the database
      const prescriptionData = {
        patientEmail: patient.email,
        patientName: patient.name,
        doctorEmail: user.email,
        doctorName: doctorInfo.name || user.name,
        doctorSpecialty: doctorInfo.specialty,
        chamber: doctorInfo.chamber,
        chamberPhone: doctorInfo.phone,
        medicines: validMedicines.map((m) => ({
          name: m.name,
          duration: m.duration,
          morning: m.morning,
          afternoon: m.afternoon,
          evening: m.evening,
        })),
      };

      console.log("Submitting prescription:", prescriptionData);

      const response = await authPost(
        "/digital-prescriptions",
        prescriptionData,
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", errorData);
        throw new Error(
          errorData.message || `Server error: ${response.status}`,
        );
      }

      alert("Prescription saved successfully!");
      onClose(); // Close the modal after successful save
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Failed to save prescription: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#67cffe]" />
            Create Prescription
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Section */}
        <div className="p-6 space-y-6">
          {/* Doctor Info Form */}
          <div className="bg-gray-50 p-4 rounded-xl space-y-3">
            <h3 className="font-semibold text-gray-700">Doctor Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  placeholder="Specialization"
                  value={doctorInfo.specialty}
                  onChange={(e) =>
                    setDoctorInfo({ ...doctorInfo, specialty: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Select Chamber
                </label>
                {doctorProfile?.chambers &&
                doctorProfile.chambers.length > 0 ? (
                  <select
                    value={doctorInfo.chamber}
                    onChange={handleChamberChange}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent bg-white"
                  >
                    {doctorProfile.chambers.map((chamber, idx) => (
                      <option key={idx} value={chamber.name}>
                        {chamber.name} - {chamber.address}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="No chambers found"
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"
                  />
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Chamber Address
                </label>
                <input
                  type="text"
                  value={selectedChamber?.address || ""}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Chamber Phone
                </label>
                <input
                  type="tel"
                  value={doctorInfo.phone}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
                />
              </div>

              {selectedChamber?.startTime && selectedChamber?.endTime && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chamber Timing
                  </label>
                  <input
                    type="text"
                    value={`${selectedChamber.startTime} - ${selectedChamber.endTime}`}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Medicine List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">Medicines</h3>
              <button
                onClick={addMedicine}
                className="flex items-center gap-1 px-3 py-1.5 bg-[#67cffe] text-white rounded-lg hover:shadow-lg transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            {medicines.map((medicine, index) => (
              <div
                key={medicine.id}
                className="bg-gray-50 p-4 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-600">
                    #{index + 1}
                  </span>
                  {medicines.length > 1 && (
                    <button
                      onClick={() => removeMedicine(medicine.id)}
                      className="text-red-500 hover:bg-red-50 p-1 rounded"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Medicine Name"
                  value={medicine.name}
                  onChange={(e) =>
                    updateMedicine(medicine.id, "name", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
                />

                <input
                  type="text"
                  placeholder="Duration (e.g., 7 days, 2 months)"
                  value={medicine.duration}
                  onChange={(e) =>
                    updateMedicine(medicine.id, "duration", e.target.value)
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#67cffe] focus:border-transparent"
                />

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicine.morning}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "morning", e.target.checked)
                      }
                      className="w-5 h-5 text-[#67cffe] rounded focus:ring-[#67cffe]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Morning
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicine.afternoon}
                      onChange={(e) =>
                        updateMedicine(
                          medicine.id,
                          "afternoon",
                          e.target.checked,
                        )
                      }
                      className="w-5 h-5 text-[#67cffe] rounded focus:ring-[#67cffe]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Afternoon
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={medicine.evening}
                      onChange={(e) =>
                        updateMedicine(medicine.id, "evening", e.target.checked)
                      }
                      className="w-5 h-5 text-[#67cffe] rounded focus:ring-[#67cffe]"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Evening
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={submitPrescription}
              disabled={loading}
              className="px-6 py-2 bg-linear-to-r from-[#67cffe] to-[#304d5d] text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Prescription"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionGenerator;
