// FILE: src/pages/admin/UsersList.jsx
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaEye,
  FaEdit,
  FaBan,
  FaTrash,
  FaEnvelope,
  FaSearch,
  FaUserShield,
  FaUsers,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UsersList() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(''); // "" | "DOCTOR" | "PATIENT" | "PHARMACY"

  const [viewUser, setViewUser] = useState(null);

  const user = {
    id: localStorage.getItem('userId'),
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'Admin',
  };

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admins/users');
      setUsers(res.data || []);
    } catch (err) {
      toast.error('Registry Sync Failure: Could not load user base.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visibleUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users || [])
      .filter((u) => (roleFilter ? u.role === roleFilter : true))
      .filter((u) =>
        q
          ? u.name?.toLowerCase()?.includes(q) ||
            u.email?.toLowerCase()?.includes(q)
          : true
      );
  }, [users, roleFilter, search]);

  const handleSuspend = async (id) => {
    if (
      !window.confirm(
        'Authorize Protocol: Revoke platform access for this subject?'
      )
    )
      return;
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      toast.warning('Subject Status: RESTRICTED.');
      await loadUsers();
    } catch (err) {
      toast.error('Protocol Error.');
    }
  };

  return (
    <DashboardLayout role="ADMIN" user={user}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-1">
              Platform Intelligence
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaUsers className="text-[var(--brand-blue)]" /> User Registry
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search Subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-64 pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] text-xs font-black text-black outline-none focus:border-[var(--brand-blue)] uppercase tracking-widest"
            >
              <option value="">All Tiers</option>
              <option value="DOCTOR">Doctor</option>
              <option value="PATIENT">Patient</option>
              <option value="PHARMACY">Pharmacy</option>
            </select>
          </div>
        </div>

        <div className="card !p-0 overflow-hidden border border-[var(--border)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Subject Identity
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Communications
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Tier Clearance
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Session Status
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse uppercase tracking-[0.2em]"
                    >
                      Syncing Global Registry...
                    </td>
                  </tr>
                ) : visibleUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-[0.2em]"
                    >
                      No Identities Found in Buffer.
                    </td>
                  </tr>
                ) : (
                  visibleUsers.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-[var(--bg-glass)] transition-colors group"
                    >
                      <td className="px-8 py-5 text-sm font-black text-[var(--text-main)] uppercase tracking-tight">
                        {u.name}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-[var(--text-soft)]">
                        {u.email}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--brand-blue)]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            u.isSuspended
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}
                        >
                          {u.isSuspended ? 'RESTRICTED' : 'AUTHORIZED'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setViewUser(u)}
                            className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => handleSuspend(u.id)}
                            className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaBan size={14} />
                          </button>
                          <button
                            onClick={() =>
                              navigate('/admin/messages/send', {
                                state: { receiverId: u.id },
                              })
                            }
                            className="p-2.5 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEnvelope size={14} />
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

      {/* Identity Vault Modal */}
      {viewUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--bg-main)]/90 backdrop-blur-md"
            onClick={() => setViewUser(null)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-10 animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              <FaUserShield className="text-[var(--brand-blue)]" /> Identity
              Vault
            </h3>
            <div className="space-y-6 mb-10">
              <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[var(--border)] text-[var(--text-main)]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Clearance Tier
                  </p>
                  <p className="text-sm font-black text-[var(--brand-blue)]">
                    {viewUser.role}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                    Protocol Status
                  </p>
                  <p className="text-sm font-black">
                    {viewUser.isSuspended ? 'RESTRICTED' : 'AUTHORIZED'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  Subject Identity
                </p>
                <p className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">
                  {viewUser.name}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                  Communications Gateway
                </p>
                <p className="text-sm font-black text-[var(--text-soft)]">
                  {viewUser.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => setViewUser(null)}
              className="btn btn-primary w-full shadow-lg bg-[var(--brand-blue)] border-[var(--brand-blue)]"
            >
              Close Clearance
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
