import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";
import { authDelete, authFetch, authGet } from "../utils/api";
import { TrendingUp, CheckCircle, XCircle, Clock } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDoctors: 0,
    pendingApplications: 0,
    totalAdmins: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [doctorActivities, setDoctorActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(true);

  useEffect(() => {
    fetchStatistics();
    fetchAccounts();
    fetchDoctorActivities();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await authGet("/admin/statistics");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async ({
    query = searchQuery,
    role = roleFilter,
  } = {}) => {
    setLoadingAccounts(true);
    try {
      const params = new URLSearchParams();
      if (query?.trim()) params.set("query", query.trim());
      if (role && role !== "all") params.set("role", role);

      const response = await authGet(`/admin/accounts?${params.toString()}`);
      const data = await response.json();
      setAccounts(Array.isArray(data.accounts) ? data.accounts : []);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      setAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const fetchDoctorActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await authGet("/admin/doctor-activities");
      const data = await response.json();
      setDoctorActivities(Array.isArray(data) ? data.slice(0, 10) : []);
    } catch (error) {
      console.error("Error fetching doctor activities:", error);
      setDoctorActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    await fetchAccounts();
  };

  const handleQuickRoleFilter = async (nextRole) => {
    setRoleFilter(nextRole);
    await fetchAccounts({ query: searchQuery, role: nextRole });
  };

  const handleToggleBlock = async (account) => {
    const nextBlockedState = !account.blocked;
    setActionLoadingId(account._id);
    try {
      const response = await authFetch(`/admin/accounts/${account._id}/block`, {
        method: "PATCH",
        body: JSON.stringify({ blocked: nextBlockedState }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update account block status");
      }

      await fetchAccounts();
    } catch (error) {
      console.error("Error updating block status:", error);
      alert(error.message || "Failed to update block status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAccount = async (account) => {
    const confirmed = window.confirm(
      `Delete ${account.role} account for ${account.email}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setActionLoadingId(account._id);
    try {
      const response = await authDelete(`/admin/accounts/${account._id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      await Promise.all([fetchAccounts(), fetchStatistics()]);
    } catch (error) {
      console.error("Error deleting account:", error);
      alert(error.message || "Failed to delete account");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] via-[#b2ebf2] to-[#d1f6ff] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-white/20">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#304d5d] to-[#67cffe] bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-[#304d5d] mt-2 font-medium">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-[#304d5d]">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {loading ? "..." : stats.totalUsers}
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-[#304d5d]">
              Total Doctors
            </h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {loading ? "..." : stats.totalDoctors}
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-[#304d5d]">
              Pending Applications
            </h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {loading ? "..." : stats.pendingApplications}
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20 hover:shadow-lg transition-all">
            <h3 className="text-lg font-semibold text-[#304d5d]">
              Total Admins
            </h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {loading ? "..." : stats.totalAdmins}
            </p>
          </div>
        </div>

        {/* Recent Doctor Activity Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-white/20">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={24} className="text-[#67cffe]" />
            <h2 className="text-xl font-bold text-[#304d5d]">
              Recent Doctor Activity
            </h2>
          </div>

          {loadingActivities ? (
            <p className="text-[#304d5d] font-medium">Loading activities...</p>
          ) : doctorActivities.length === 0 ? (
            <p className="text-gray-500">No doctor activities yet</p>
          ) : (
            <div className="h-[50vh] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-[#304d5d]/10 to-[#67cffe]/10 border-b-2 border-[#67cffe]/20">
                  <tr>
                    <th className="text-left p-3 font-bold text-[#304d5d]">
                      Doctor Name
                    </th>
                    <th className="text-center p-3 font-bold text-[#304d5d]">
                      Completed
                    </th>
                    <th className="text-center p-3 font-bold text-[#304d5d]">
                      Upcoming
                    </th>
                    <th className="text-center p-3 font-bold text-[#304d5d]">
                      Cancelled
                    </th>
                    <th className="text-center p-3 font-bold text-[#304d5d]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {doctorActivities.map((activity, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-[#67cffe]/5 transition-colors"
                    >
                      <td className="p-3 font-medium text-[#304d5d]">
                        {activity.doctorName || "Unknown"}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          <CheckCircle size={14} />
                          {activity.completedCount || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                          <Clock size={14} />
                          {activity.upcomingCount || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          <XCircle size={14} />
                          {activity.cancelledCount || 0}
                        </span>
                      </td>
                      <td className="p-3 text-center font-bold text-[#67cffe]">
                        {(activity.completedCount || 0) +
                          (activity.upcomingCount || 0) +
                          (activity.cancelledCount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 mb-6 border border-white/20">
          <h2 className="text-xl font-bold text-[#304d5d] mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickRoleFilter("user")}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg hover:shadow-blue-200 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Manage Users
            </button>
            <button
              onClick={() => handleQuickRoleFilter("doctor")}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:shadow-lg hover:shadow-green-200 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Manage Doctors
            </button>
            <Link
              to="/admin/doctor-applications"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-200 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 text-center"
            >
              View Doctor Applications
            </Link>
          </div>
        </div>

        {/* Account Management */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-6 border border-white/20">
          <h2 className="text-xl font-bold text-[#304d5d] mb-4">
            Account Management
          </h2>

          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or UID"
              className="md:col-span-3 px-4 py-2 border-2 border-[#67cffe]/30 rounded-lg focus:outline-none focus:border-[#67cffe] transition-all"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#304d5d] to-[#67cffe] hover:shadow-lg hover:shadow-[#67cffe]/30 text-white font-semibold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
              disabled={loadingAccounts}
            >
              {loadingAccounts ? "Searching..." : "Search"}
            </button>
          </form>

          {loadingAccounts ? (
            <p className="text-[#304d5d] font-medium">Loading accounts...</p>
          ) : accounts.length === 0 ? (
            <p className="text-gray-500">No accounts found for this search.</p>
          ) : (
            <div className="max-h-[65vh] overflow-y-auto pr-2">
              <div className="space-y-4">
                {accounts.map((account) => {
                  const isBusy = actionLoadingId === account._id;
                  return (
                    <div
                      key={account._id}
                      className="border-2 border-[#67cffe]/20 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-[#67cffe]/50 transition-all"
                    >
                      <div>
                        <p className="font-semibold text-[#304d5d]">
                          {account.name || "Unnamed"}
                        </p>
                        <p className="text-sm text-gray-600">{account.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          UID: {account.uid ?? "N/A"} | Role:{" "}
                          {account.role || "user"}
                        </p>
                        <p
                          className={`text-xs mt-1 font-semibold ${
                            account.blocked
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {account.blocked ? "Blocked" : "Active"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleBlock(account)}
                          className={`px-4 py-2 rounded-lg text-white font-semibold transition-all ${
                            account.blocked
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-amber-500 hover:bg-amber-600"
                          } disabled:opacity-60`}
                        >
                          {isBusy
                            ? "Updating..."
                            : account.blocked
                              ? "Unblock"
                              : "Block"}
                        </button>

                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteAccount(account)}
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60 transition-all"
                        >
                          {isBusy ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
