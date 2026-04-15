import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../Components/Context/AuthContext";
import { authDelete, authFetch, authGet } from "../utils/api";

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

  useEffect(() => {
    fetchStatistics();
    fetchAccounts();
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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>

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

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickRoleFilter("user")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
              Manage Users
            </button>
            <button
              onClick={() => handleQuickRoleFilter("doctor")}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg transition"
            >
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

        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
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
              className="md:col-span-3 px-4 py-2 border rounded-lg"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg"
              disabled={loadingAccounts}
            >
              {loadingAccounts ? "Searching..." : "Search"}
            </button>
          </form>

          {loadingAccounts ? (
            <p className="text-gray-500">Loading accounts...</p>
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
                      className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">
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
                          className={`px-4 py-2 rounded-lg text-white font-semibold ${
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
                          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-60"
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
