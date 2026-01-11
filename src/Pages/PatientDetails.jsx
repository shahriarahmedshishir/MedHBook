import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FileText, Pill, Activity } from "lucide-react";

const getFullImageURL = (imgPath) => {
  if (!imgPath) return "https://i.pravatar.cc/100";
  return `${
    import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
  }${imgPath}`;
};

const PatientDetails = () => {
  const location = useLocation();
  const { email, uid, name, img } = location.state || {};

  const [prescriptions, setPrescriptions] = useState([]);
  const [reports, setReports] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    if (!email && !uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

        const fetchAndSort = async (url) => {
          const res = await fetch(url);
          const data = await res.json();
          return data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
        };

        // Fetch patient details
        if (email) {
          const userRes = await fetch(`${base}/user/${email}`);
          const userData = await userRes.json();
          setPatientData(userData);
        }

        setPrescriptions(
          await fetchAndSort(
            `${base}/prescriptions?${uid ? `uid=${uid}` : `email=${email}`}`
          )
        );
        setReports(
          await fetchAndSort(
            `${base}/reports?${uid ? `uid=${uid}` : `email=${email}`}`
          )
        );
        setXrays(
          await fetchAndSort(
            `${base}/xrays?${uid ? `uid=${uid}` : `email=${email}`}`
          )
        );
      } catch (err) {
        console.error(err);
        alert("Error fetching patient data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [email, uid]);

  if (!email && !uid)
    return <p className="p-6 text-center">No patient data provided</p>;

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-medium">
        Loading patient data...
      </div>
    );

  const Section = ({ title, icon: Icon, data }) => (
    <div className="mb-10">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
        <Icon className="w-5 h-5 text-teal-500" /> {title}
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center">
          No {title.toLowerCase()} found
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 justify-items-center">
          {data.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-md p-4 w-64 cursor-pointer hover:shadow-xl transition"
              onClick={() => setModalImg(getFullImageURL(item.img))}
            >
              <p className="font-medium text-gray-800 mb-1 truncate">
                Doctor: {item.doctorName}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
              {item.img && (
                <img
                  src={getFullImageURL(item.img)}
                  alt={item.doctorName}
                  className="w-full h-32 object-cover rounded-lg"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Patient Card */}
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl p-6 mb-12">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src={getFullImageURL(img)}
            alt={name}
            className="w-28 h-28 rounded-full border-4 border-teal-300 object-cover"
          />
          <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
          <p className="text-gray-600">UID: {uid}</p>
          <p className="text-gray-600">Email: {email}</p>
          {patientData?.mobileNo && (
            <p className="text-gray-600">Phone: {patientData.mobileNo}</p>
          )}
          {patientData?.bloodGroup && (
            <p className="text-gray-600">
              Blood Group: {patientData.bloodGroup}
            </p>
          )}
        </div>

        {/* Medical Information */}
        {patientData && (
          <div className="border-t pt-4 space-y-3">
            <h4 className="text-lg font-semibold text-gray-700 mb-3 text-center">
              Medical Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">
                  Allergies:
                </span>
                <span className="text-sm text-gray-800">
                  {patientData.hasAllergy ? (
                    <span className="text-red-600 font-medium">
                      Yes - {patientData.allergyDetails || "Not specified"}
                    </span>
                  ) : (
                    <span className="text-green-600 font-medium">No</span>
                  )}
                </span>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">
                  Diabetic Level (HbA1c):
                </span>
                <span className="text-sm text-gray-800">
                  {patientData.diabeticLevel ? (
                    <span
                      className={`font-medium ${
                        parseFloat(patientData.diabeticLevel) >= 6.5
                          ? "text-red-600"
                          : parseFloat(patientData.diabeticLevel) >= 5.7
                          ? "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {patientData.diabeticLevel}%
                      {parseFloat(patientData.diabeticLevel) >= 6.5
                        ? " (Diabetic)"
                        : parseFloat(patientData.diabeticLevel) >= 5.7
                        ? " (Pre-diabetic)"
                        : " (Normal)"}
                    </span>
                  ) : (
                    <span className="text-gray-400">Not recorded</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sections */}
      <Section title="Prescriptions" icon={Pill} data={prescriptions} />
      <Section title="Reports" icon={FileText} data={reports} />
      <Section title="X-Rays" icon={Activity} data={xrays} />

      {/* Image Modal */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImg}
              alt="Fullscreen"
              className="max-h-[90vh] max-w-[90vw] rounded-xl"
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

export default PatientDetails;
