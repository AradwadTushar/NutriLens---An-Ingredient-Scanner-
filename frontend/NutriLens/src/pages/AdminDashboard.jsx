import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import Button from "../components/ui/Button";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [actionLoadingEmail, setActionLoadingEmail] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Fetch admin verification and user list
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      // 1. Verify admin role
      const meRes = await fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (meRes.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }

      const meData = await meRes.json();
      if (meData.role !== "admin") {
        setError("Access Denied: You need an administrator account to view this page.");
        setLoading(false);
        return;
      }

      // 2. Fetch users list
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to load users list.");
      }

      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Reset or top up quota
  const handleUpdateQuota = async (email, resetUsed = true, addLimit = null) => {
    setActionLoadingEmail(email);
    const token = localStorage.getItem("token");

    try {
      const payload = { resetUsed };
      if (addLimit !== null) {
        payload.scansLimit = addLimit;
      }

      const res = await fetch(`/api/admin/users/${encodeURIComponent(email)}/reset-quota`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update user quota.");
      }

      showToast(`✅ Successfully updated quota for ${email}`);
      // Refresh user list
      fetchUsers();
    } catch (err) {
      alert(`Error updating quota: ${err.message}`);
    } finally {
      setActionLoadingEmail(null);
    }
  };

  // Computed metrics
  const metrics = useMemo(() => {
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "admin").length;
    const totalScans = users.reduce((acc, u) => acc + (u.scansUsed || 0), 0);
    const exhaustedUsers = users.filter(
      (u) => u.role !== "admin" && u.scansLimit !== -1 && (u.scansUsed || 0) >= (u.scansLimit || 2)
    ).length;

    return { totalUsers, totalAdmins, totalScans, exhaustedUsers };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole =
        roleFilter === "all" ||
        (roleFilter === "admin" && u.role === "admin") ||
        (roleFilter === "user" && u.role !== "admin") ||
        (roleFilter === "exhausted" && u.role !== "admin" && (u.scansUsed || 0) >= (u.scansLimit || 2));

      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 font-manrope">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-3xl">gpp_bad</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">Admin Access Required</h2>
          <p className="text-sm text-on-surface-variant">{error}</p>
          <div className="pt-2">
            <NavLink
              to="/landing"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Dashboard
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface font-manrope pb-16">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-neutral-700">
          <span className="material-symbols-outlined text-green-400 text-[20px]">check_circle</span>
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <section className="bg-gradient-to-r from-primary via-indigo-900 to-primary text-white py-10 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold backdrop-blur-sm border border-white/20">
                <span className="material-symbols-outlined text-xs">verified_user</span>
                System Administration
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Admin & Quota Console</h1>
            <p className="text-white/80 text-sm mt-1 max-w-xl">
              Monitor registered users, inspect real-time AI scan consumption, and adjust quotas to prevent bot runaway costs.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur-sm transition-all border border-white/20 active:scale-95 disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-[18px] ${loading ? "animate-spin" : ""}`}>
                sync
              </span>
              Refresh
            </button>
            <NavLink
              to="/scanner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-primary text-sm font-bold shadow-lg hover:bg-neutral-100 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              Open Scanner
            </NavLink>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 -mt-6">
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">group</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Total Registered</p>
              <h3 className="text-2xl font-bold text-on-surface">{metrics.totalUsers}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">manage_accounts</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Admins</p>
              <h3 className="text-2xl font-bold text-on-surface">{metrics.totalAdmins}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">analytics</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Total Scans Run</p>
              <h3 className="text-2xl font-bold text-on-surface">{metrics.totalScans}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-outline-variant/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">hourglass_bottom</span>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant font-medium">Quota Exhausted</p>
              <h3 className="text-2xl font-bold text-amber-700">{metrics.exhaustedUsers}</h3>
            </div>
          </div>
        </div>

        {/* Filter and Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
          {/* Controls bar */}
          <div className="p-4 sm:p-5 border-b border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                search
              </span>
              <input
                type="text"
                placeholder="Search email, company, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-container-low rounded-xl text-sm border border-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            {/* Role Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl self-stretch sm:self-auto overflow-x-auto">
              {[
                { id: "all", label: "All Users" },
                { id: "user", label: "Free Tier" },
                { id: "exhausted", label: "Exhausted" },
                { id: "admin", label: "Admins" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    roleFilter === tab.id
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-20 text-center text-on-surface-variant space-y-3">
                <span className="material-symbols-outlined text-4xl animate-spin text-primary">
                  progress_activity
                </span>
                <p className="text-sm">Loading users & scan statistics...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-20 text-center text-on-surface-variant space-y-2">
                <span className="material-symbols-outlined text-4xl text-neutral-300">
                  person_search
                </span>
                <p className="text-base font-semibold">No users found</p>
                <p className="text-xs">Try adjusting your search query or filter.</p>
              </div>
            ) : (
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant/20 text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    <th className="py-3.5 px-5">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Scans Usage</th>
                    <th className="py-3.5 px-4">Remaining</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/15">
                  {filteredUsers.map((user) => {
                    const isAdmin = user.role === "admin";
                    const isExhausted = !isAdmin && user.scansLimit !== -1 && user.scansUsed >= user.scansLimit;
                    const percent = isAdmin
                      ? 100
                      : Math.min(100, Math.round(((user.scansUsed || 0) / (user.scansLimit || 2)) * 100));

                    return (
                      <tr key={user.id || user.email} className="hover:bg-surface-container-low/40 transition-colors">
                        {/* User column */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                                isAdmin
                                  ? "bg-purple-100 text-purple-700 ring-2 ring-purple-200"
                                  : "bg-surface-container-high text-primary"
                              }`}
                            >
                              {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-on-surface truncate flex items-center gap-1.5">
                                {user.email}
                                {isAdmin && (
                                  <span className="material-symbols-outlined text-purple-600 text-[16px]" title="Admin">
                                    verified
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-on-surface-variant truncate">
                                {user.companyName || "No Company"} • {user.phone || "No Phone"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isAdmin
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-neutral-100 text-neutral-700 border border-neutral-200"
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isAdmin ? "security" : "person"}
                            </span>
                            {isAdmin ? "Admin" : "User"}
                          </span>
                        </td>

                        {/* Usage Progress */}
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <span className="text-xs font-semibold text-purple-700 flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">all_inclusive</span>
                              Unlimited
                            </span>
                          ) : (
                            <div className="space-y-1.5 max-w-[140px]">
                              <div className="flex justify-between text-xs font-medium">
                                <span className={isExhausted ? "text-red-600 font-bold" : "text-on-surface"}>
                                  {user.scansUsed} / {user.scansLimit}
                                </span>
                                <span className="text-on-surface-variant">{percent}%</span>
                              </div>
                              <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isExhausted ? "bg-red-500" : percent > 50 ? "bg-amber-500" : "bg-primary"
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Remaining */}
                        <td className="py-4 px-4">
                          {isAdmin ? (
                            <span className="text-xs text-on-surface-variant">∞</span>
                          ) : isExhausted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-red-100 text-red-700">
                              Exhausted
                            </span>
                          ) : (
                            <span className="text-xs font-semibold text-green-700">
                              {user.scansRemaining} scans
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          {isAdmin ? (
                            <span className="text-xs text-on-surface-variant italic">System Account</span>
                          ) : (
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => handleUpdateQuota(user.email, true)}
                                disabled={actionLoadingEmail === user.email}
                                title="Reset scans used back to 0"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-surface-container-high hover:bg-surface-variant text-on-surface transition-all active:scale-95 disabled:opacity-50"
                              >
                                {actionLoadingEmail === user.email ? "Saving..." : "Reset to 0"}
                              </button>
                              <button
                                onClick={() =>
                                  handleUpdateQuota(user.email, false, (user.scansLimit || 2) + 5)
                                }
                                disabled={actionLoadingEmail === user.email}
                                title="Add +5 to scan limit"
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary transition-all active:scale-95 disabled:opacity-50"
                              >
                                +5 Scans
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

