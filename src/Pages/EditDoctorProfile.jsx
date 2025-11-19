import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../Components/Context/AuthContext";

const EditDoctorProfile = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    specialization: "",
    licenseNumber: "",
    yearsOfExperience: "",
    education: "",
    certifications: [],
    bio: "",
    uid: "", // store uid
  });

  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    axios
      .get(`http://localhost:3000/doctor/${user.email}`)
      .then((res) => {
        const data = res.data;
        setFormData({
          name: user.name,
          email: user.email,
          phone: data.phone || "",
          address: data.address || "",
          specialization: data.specialization || "",
          licenseNumber: data.licenseNumber || "",
          yearsOfExperience: data.yearsOfExperience || "",
          education: data.education || "",
          certifications: data.certifications || [],
          bio: data.bio || "",
          uid: user.uid, // always add uid
        });
        setProfileExists(true);
      })
      .catch(() => {
        // No profile → create mode
        setFormData((prev) => ({
          ...prev,
          name: user.name || "",
          email: user.email || "",
          uid: user.uid || "", // set uid for new profile
        }));
        setProfileExists(false);
      });
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      name: user.name,
      email: user.email,
      uid: user.uid,
    };

    try {
      if (profileExists) {
        const res = await axios.put(
          `http://localhost:3000/doctor/${user.email}`,
          payload
        );
        console.log("Profile updated:", res.data);
        setTimeout(() => alert("Profile updated!"), 0);
      } else {
        const res = await axios.post(`http://localhost:3000/doctor`, payload);
        console.log("Profile created:", res.data);
        setTimeout(() => alert("Profile created!"), 0);
        setProfileExists(true);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error("Axios error:", err);
        alert("Something went wrong");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f7fa] to-[#b2ebf2] p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-2xl font-extrabold mb-6 text-gray-800">
          Edit Doctor Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {" "}
          <div>
            <label className="block mb-1 font-medium">Full Name</label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full border p-2 rounded-lg bg-gray-100"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Medical License Number
            </label>
            <input
              type="text"
              name="licenseNumber"
              value={formData.licenseNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">
              Years of Experience
            </label>
            <input
              type="number"
              name="yearsOfExperience"
              value={formData.yearsOfExperience}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Education</label>
            <input
              type="text"
              name="education"
              value={formData.education}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Certifications</label>
            <textarea
              name="certifications"
              rows={2}
              value={formData.certifications.join(", ")}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  certifications: e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter((c) => c.length > 0),
                }))
              }
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bio</label>
            <textarea
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-6 rounded-full"
          >
            {profileExists ? "Update Profile" : "Create Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDoctorProfile;
