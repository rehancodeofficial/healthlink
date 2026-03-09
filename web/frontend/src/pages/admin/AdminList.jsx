// FILE: src/pages/admin/AdminList.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { FaEye, FaEdit, FaBan, FaSearch, FaUserShield } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminList() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewAdmin, setViewAdmin] = useState(null);
  const [editAdmin, setEditAdmin] = useState(null);

  const user = {
    id: localStorage.getItem('userId'),
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'Admin',
  };

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/admins');
      setAdmins(res.data || []);
    } catch (err) {
      setError('Failed to fetch administrative records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdmins();
  }, [loadAdmins]);

  const visibleAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (admins || [])
      .filter((a) => (roleFilter ? a.role === roleFilter : true))
      .filter((a) =>
        q
          ? a.name?.toLowerCase()?.includes(q) ||
            a.email?.toLowerCase()?.includes(q)
          : true
      );
  }, [admins, roleFilter, search]);

  const handleSuspend = async (id) => {
    if (
      !window.confirm(
        'Authorize Protocol: Suspend administrative access for this subject?'
      )
    )
      return;
    try {
      await api.patch(`/admins/${id}/suspend`);
      toast.success('Identity Suspended');
      await loadAdmins();
    } catch (err) {
      toast.error('Suspension Failed');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admins/${editAdmin.id}`, {
        name: editAdmin.name,
        email: editAdmin.email,
        role: editAdmin.role,
      });
      toast.success('Identity Updated');
      setEditAdmin(null);
      await loadAdmins();
    } catch (err) {
      toast.error('Update Failed');
    }
  };

  return (
    <DashboardLayout role="ADMIN" user={user}>
      <div className="space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
              Internal Registry
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-3">
              <FaUserShield className="text-[var(--brand-blue)]" /> Admin
              Directory
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search Identities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none transition-all"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-6 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
            >
              <option value="">All Clearances</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPPORT">SUPPORT</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Administrator
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Encrypted Hub
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Clearance
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    System Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse"
                    >
                      Syncing Directory...
                    </td>
                  </tr>
                ) : visibleAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      No administrative identities found.
                    </td>
                  </tr>
                ) : (
                  visibleAdmins.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {a.name}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {a.email}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-main)]/50 border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                          {a.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            a.isSuspended
                              ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                              : 'bg-green-500/20 text-green-500 border border-green-500/30'
                          }`}
                        >
                          {a.isSuspended ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setViewAdmin(a)}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => setEditAdmin(a)}
                            className="p-2 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleSuspend(a.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                            title="Suspend"
                          >
                            <FaBan size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {viewAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
          
            onClick={() => setViewAdmin(null)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              Admin Identity
            </h2>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Full Name
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {viewAdmin.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Clearance
                  </p>
                  <p className="text-sm font-black text-[var(--brand-green)]">
                    {viewAdmin.role}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Access Hub
                </p>
                <p className="text-sm font-black text-[var(--text-main)]">
                  {viewAdmin.email}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Registration Date
                  </p>
                  <p className="text-sm font-black text-[var(--brand-blue)]">
                    {viewAdmin.createdAt
                      ? new Date(viewAdmin.createdAt).toLocaleDateString()
                      : 'Historical'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Protocol Status
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {viewAdmin.isSuspended ? 'RESTRICTED' : 'AUTHORIZED'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setViewAdmin(null)}
              className="btn btn-primary w-full shadow-lg"
            >
              Close Identity Vault
            </button>
          </div>
        </div>
      )}

      {editAdmin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
           onClick={() => setEditAdmin(null)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              Refine Identity
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Identity Name
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)] transition-all"
                  value={editAdmin.name}
                  onChange={(e) =>
                    setEditAdmin((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Uplink Email
                </label>
                <input
                  type="email"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)] transition-all"
                  value={editAdmin.email}
                  onChange={(e) =>
                    setEditAdmin((prev) => ({ ...prev, email: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Clearance Tier
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-black transition-all"
                  value={editAdmin.role}
                  onChange={(e) =>
                    setEditAdmin((prev) => ({ ...prev, role: e.target.value }))
                  }
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPPORT">SUPPORT</option>
                </select>
              </div>
              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-[2]">
                  Sync Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
