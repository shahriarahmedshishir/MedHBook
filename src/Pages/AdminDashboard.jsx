import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";
import api from "../utils/api";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingApplications: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/admin/statistics");
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? "..." : stats.totalUsers}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Doctors
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? "..." : stats.totalDoctors}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Pending Applications
            </h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {loading ? "..." : stats.pendingApplications}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700">
              Total Admins
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading ? "..." : stats.totalAdmins}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition">
              Manage Users
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition">
              Manage Doctors
            </button>
            <Link
              to="/admin/doctor-applications"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition text-center"
            >
              View Doctor Applications
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
