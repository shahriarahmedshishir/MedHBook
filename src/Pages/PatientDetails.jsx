import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

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
  const [loading, setLoading] = useState(true);
  const [modalImg, setModalImg] = useState(null);

  useEffect(() => {
    if (!email && !uid) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const presRes = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
          }/prescriptions?${uid ? `uid=${uid}` : `email=${email}`}`
        );
        const presData = await presRes.json();
        setPrescriptions(
          presData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );

        const repRes = await fetch(
          `${
            import.meta.env.VITE_SERVER_URL || "http://localhost:3000"
          }/reports?${uid ? `uid=${uid}` : `email=${email}`}`
        );
        const repData = await repRes.json();
        setReports(
          repData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        );
      } catch (err) {
        console.error("Error fetching details:", err);
        alert("Error fetching details: " + err.message);
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
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      {/* Patient Card */}
      <div className="max-w-sm mx-auto bg-white rounded-3xl shadow-xl p-6 flex flex-col items-center gap-4 mb-8">
        <img
          src={getFullImageURL(img)}
          alt={name}
          className="w-28 h-28 rounded-full border-4 border-teal-300 object-cover"
        />
        <h2 className="text-2xl font-bold text-gray-800">{name}</h2>
        <p className="text-gray-600">UID: {uid}</p>
        <p className="text-gray-600">Email: {email}</p>
      </div>

      {/* Prescriptions */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Prescriptions
        </h3>
        {prescriptions.length === 0 ? (
          <p className="text-gray-500 text-center">No prescriptions found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {prescriptions.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl shadow-md p-3 w-64 cursor-pointer hover:shadow-xl transition"
                onClick={() => setModalImg(getFullImageURL(p.img))}
              >
                <p className="font-medium text-gray-800 mb-1 truncate">
                  Doctor: {p.doctorName}
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(p.createdAt).toLocaleDateString()}
                </p>
                {p.img && (
                  <img
                    src={getFullImageURL(p.img)}
                    alt={p.doctorName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reports */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Reports
        </h3>
        {reports.length === 0 ? (
          <p className="text-gray-500 text-center">No reports found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
            {reports.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl shadow-md p-3 w-64 cursor-pointer hover:shadow-xl transition"
                onClick={() => setModalImg(getFullImageURL(r.img))}
              >
                <p className="font-medium text-gray-800 mb-1 truncate">
                  Doctor: {r.doctorName}
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
                {r.img && (
                  <img
                    src={getFullImageURL(r.img)}
                    alt={r.doctorName}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal with Close Button */}
      {modalImg && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setModalImg(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={modalImg}
              alt="Full screen"
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
