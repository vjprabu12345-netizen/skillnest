import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  BookOpen,
  Flag,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Search,
  Star,
  Bookmark,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'reports' | 'users'
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Resources state
  const [resources, setResources] = useState([]);
  const [resStatus, setResStatus] = useState('all');
  const [resSearch, setResSearch] = useState('');
  const [loadingResources, setLoadingResources] = useState(false);

  // Reports state
  const [reports, setReports] = useState([]);
  const [reportStatus, setReportStatus] = useState('pending');
  const [loadingReports, setLoadingReports] = useState(false);

  // Users state
  const [usersList, setUsersList] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Fetch admin stats
  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await adminAPI.getStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch resources for moderation
  const fetchAdminResources = async () => {
    try {
      setLoadingResources(true);
      const res = await adminAPI.getResources({
        status: resStatus,
        search: resSearch,
        limit: 30,
      });
      if (res.data.success) {
        setResources(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  // Fetch reported resources
  const fetchAdminReports = async () => {
    try {
      setLoadingReports(true);
      const res = await adminAPI.getReports({ status: reportStatus });
      if (res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  // Fetch users
  const fetchAdminUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await adminAPI.getUsers({ search: userSearch, limit: 30 });
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeTab === 'resources') fetchAdminResources();
    if (activeTab === 'reports') fetchAdminReports();
    if (activeTab === 'users') fetchAdminUsers();
  }, [activeTab, resStatus, reportStatus]);

  // Actions
  const handleUpdateResourceStatus = async (resourceId, newStatus) => {
    try {
      const res = await adminAPI.updateResourceStatus(resourceId, { status: newStatus });
      if (res.data.success) {
        addToast(`Resource updated to "${newStatus}"`, 'success');
        fetchAdminResources();
        fetchStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update resource status', 'error');
    }
  };

  const handleToggleFeature = async (resourceId, currentFeatured) => {
    try {
      const res = await adminAPI.updateResourceStatus(resourceId, { isFeatured: !currentFeatured });
      if (res.data.success) {
        addToast(
          !currentFeatured ? 'Resource marked as Featured!' : 'Resource un-featured.',
          'info'
        );
        fetchAdminResources();
      }
    } catch (err) {
      addToast('Failed to toggle featured status', 'error');
    }
  };

  const handleUpdateReportStatus = async (reportId, newStatus) => {
    try {
      const res = await adminAPI.updateReportStatus(reportId, { status: newStatus });
      if (res.data.success) {
        addToast(`Report marked as ${newStatus}`, 'info');
        fetchAdminReports();
        fetchStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update report status', 'error');
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (
      !window.confirm(
        `Are you sure you want to change ${targetUser.name}'s role to ${newRole.toUpperCase()}?`
      )
    ) {
      return;
    }

    try {
      const res = await adminAPI.updateUserRole(targetUser._id, { role: newRole });
      if (res.data.success) {
        addToast(`${targetUser.name} is now ${newRole}`, 'success');
        fetchAdminUsers();
        fetchStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change user role', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Master Administration Console</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">
            SkillNest Administration & Moderation
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Real-time management for users, educational resources, reports, and system metrics.
          </p>
        </div>

        <button
          onClick={() => {
            fetchStats();
            if (activeTab === 'resources') fetchAdminResources();
            if (activeTab === 'reports') fetchAdminReports();
            if (activeTab === 'users') fetchAdminUsers();
            addToast('Refreshed administrative data.', 'info');
          }}
          className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Learners</span>
              <Users className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {stats.users?.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.users?.admins} administrators
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Total Resources</span>
              <BookOpen className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {stats.resources?.total}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.resources?.approved} approved / {stats.resources?.pending} pending
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>User Engagement</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-extrabold text-white mt-2">
              {stats.engagement?.reviews}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.engagement?.favourites} bookmarks saved
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Moderation Reports</span>
              <Flag className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-extrabold text-rose-400 mt-2">
              {stats.reports?.pending}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {stats.reports?.total} total reports filed
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resources Moderation</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'reports'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <Flag className="w-4 h-4" />
          <span>Reported Items {stats?.reports?.pending > 0 && `(${stats.reports.pending})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Management</span>
        </button>
      </div>

      {/* Resources Moderation Tab */}
      {activeTab === 'resources' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['all', 'approved', 'pending', 'rejected'].map((s) => (
                <button
                  key={s}
                  onClick={() => setResStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    resStatus === s
                      ? 'bg-navy-800 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search resources..."
                value={resSearch}
                onChange={(e) => setResSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdminResources()}
                className="input-field text-xs py-2 w-full sm:w-64"
              />
              <button
                onClick={fetchAdminResources}
                className="btn-secondary text-xs !py-2 !px-3"
              >
                Search
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Resource</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Author</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Featured</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loadingResources ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Loading resources...
                    </td>
                  </tr>
                ) : resources.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500">
                      No resources found matching filter.
                    </td>
                  </tr>
                ) : (
                  resources.map((r) => (
                    <tr key={r._id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-white max-w-xs truncate">
                          {r.title}
                        </div>
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-brand-cyan hover:underline flex items-center gap-1 max-w-xs truncate"
                        >
                          <span>{r.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                          {r.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">
                        {r.author?.name || 'Unknown'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : r.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => handleToggleFeature(r._id, r.isFeatured)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                            r.isFeatured
                              ? 'bg-violet-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {r.isFeatured ? '★ Featured' : 'Standard'}
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        {r.status !== 'approved' && (
                          <button
                            onClick={() => handleUpdateResourceStatus(r._id, 'approved')}
                            className="p-1 rounded bg-emerald-950/80 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30"
                            title="Approve Resource"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateResourceStatus(r._id, 'rejected')}
                            className="p-1 rounded bg-rose-950/80 text-rose-400 hover:bg-rose-900 border border-rose-500/30"
                            title="Reject Resource"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {['pending', 'resolved', 'dismissed', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setReportStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  reportStatus === s
                    ? 'bg-navy-800 text-brand-cyan border border-brand-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {loadingReports ? (
              <div className="p-8 text-center text-slate-400">Loading reports...</div>
            ) : reports.length === 0 ? (
              <div className="glass-card p-8 rounded-2xl text-center text-slate-500 border border-slate-800">
                No reports found in this status category.
              </div>
            ) : (
              reports.map((rep) => (
                <div
                  key={rep._id}
                  className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950/80 text-rose-400 border border-rose-500/30">
                        {rep.reason}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reported by {rep.reportingUser?.name || 'User'}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white pt-1">
                      Resource: {rep.resource?.title || 'Unknown Title'}
                    </div>
                    {rep.description && (
                      <p className="text-xs text-slate-300 italic">
                        "{rep.description}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleUpdateReportStatus(rep._id, 'resolved')}
                          className="btn-primary text-xs !py-1.5 !px-3 !bg-emerald-600"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateReportStatus(rep._id, 'dismissed')}
                          className="btn-secondary text-xs !py-1.5 !px-3"
                        >
                          Dismiss
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400 capitalize">
                        Status: {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAdminUsers()}
                className="input-field text-xs py-2 w-full sm:w-72"
              />
              <button
                onClick={fetchAdminUsers}
                className="btn-secondary text-xs !py-2 !px-3"
              >
                Search
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 overflow-x-auto shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-900/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Email</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-400">
                      Loading users...
                    </td>
                  </tr>
                ) : usersList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-navy-800/40 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-white flex items-center gap-2.5">
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-7 h-7 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <span>{u.name}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400">{u.email}</td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-violet-950/80 text-violet-300 border border-violet-500/40'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {u._id !== user._id && (
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            className="btn-secondary !py-1 !px-2.5 text-[11px]"
                          >
                            Set {u.role === 'admin' ? 'User' : 'Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
