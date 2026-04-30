// FILE: src/pages/superadmin/ManageAdmins.jsx
import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import {
  fetchAdmins,
  createAdmin,
  updateAdmin,
  suspendAdmin,
  deleteAdmin,
} from '../../Lib/api';
import {
  FaEye,
  FaTrash,
  FaEdit,
  FaBan,
  FaPlus,
  FaSearch,
  FaUserShield,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'ADMIN',
  });
  const [filterRole, setFilterRole] = useState('');
  const [search, setSearch] = useState('');

  const user = {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
  };

  useEffect(() => {
    loadAdmins();
  }, [filterRole]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await fetchAdmins(filterRole);
      setAdmins(data || []);
    } catch (err) {
      toast.error('Failed to sync administrative directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createAdmin(form);
      toast.success('Identity Created Successfully.');
      setShowCreateModal(false);
      setForm({ name: '', email: '', password: '', role: 'ADMIN' });
      loadAdmins();
    } catch (err) {
      toast.error('Protocol Error: Identity creation failed.');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await updateAdmin(showEditModal.id, {
        name: showEditModal.name,
        role: showEditModal.role,
      });
      toast.success('Identity Updated.');
      setShowEditModal(null);
      loadAdmins();
    } catch (err) {
      toast.error('Update Failed.');
    }
  };

  const handleSuspend = async (id) => {
    if (!window.confirm('Authorize Protocol: Suspend this administrator?'))
      return;
    try {
      await suspendAdmin(id);
      toast.success('Identity Suspended.');
      loadAdmins();
    } catch (err) {
      toast.error('Suspension Protocol Failed.');
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        '⚠️ IRREVERSIBLE ACTION: Permanently purge this identity?'
      )
    )
      return;
    try {
      await deleteAdmin(id);
      toast.info('Identity Purged from Registry.');
      loadAdmins();
    } catch (err) {
      toast.error('Purge Failed.');
    }
  };

  const visibleAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)
    );
  }, [admins, search]);

  return (
    <DashboardLayout role="SUPERADMIN" user={user}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.4em] mb-1">
              Command & Control
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaUserShield className="text-[var(--brand-blue)]" /> Admin Core
            </h1>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary px-8 py-4 shadow-lg shadow-[var(--brand-blue)]/20 flex items-center gap-3"
          >
            <FaPlus /> Initialize New Identity
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search Database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none transition-all shadow-sm"
            />
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-6 py-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-black text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none shadow-sm uppercase tracking-widest"
          >
            <option value="">All Clearances</option>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPPORT">SUPPORT</option>
          </select>
        </div>

        <div className="card !p-0 overflow-hidden border border-[var(--border)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Administrator
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Hub Email
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Clearance
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Protocol Status
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
                      Syncing Administrative Data...
                    </td>
                  </tr>
                ) : visibleAdmins.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-[0.2em]"
                    >
                      No Identities Found.
                    </td>
                  </tr>
                ) : (
                  visibleAdmins.map((admin) => (
                    <tr
                      key={admin.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-8 py-5 text-sm font-black text-[var(--text-main)] uppercase tracking-tight">
                        {admin.name}
                      </td>
                      <td className="px-8 py-5 text-xs font-bold text-[var(--text-soft)]">
                        {admin.email}
                      </td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 rounded-full bg-[var(--bg-main)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--brand-blue)]">
                          {admin.role}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            admin.isSuspended
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-green-500/10 text-green-500 border border-green-500/20'
                          }`}
                        >
                          {admin.isSuspended ? 'RESTRICTED' : 'AUTHORIZED'}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setShowViewModal(admin)}
                            className="p-2.5 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => setShowEditModal(admin)}
                            className="p-2.5 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleSuspend(admin.id)}
                            className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                            title="Suspend"
                          >
                            <FaBan size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(admin.id)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                            title="Delete"
                          >
                            <FaTrash size={14} />
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

      {/* Modals - Unified Design */}
      {(showCreateModal || showEditModal || showViewModal) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--bg-main)]/90 backdrop-blur-md"
            onClick={() => {
              setShowCreateModal(false);
              setShowEditModal(null);
              setShowViewModal(null);
            }}
          ></div>
          <div className="relative w-full max-w-lg glass !p-10 animate-in zoom-in-95 duration-300">
            {showCreateModal && (
              <>
                <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-8">
                  Initialize Identity
                </h3>
                <form onSubmit={handleCreate} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Identity Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Uplink Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Encryption Key (Password)
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Clearance Tier
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) =>
                        setForm({ ...form, role: e.target.value })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-black text-black focus:border-[var(--brand-blue)] outline-none"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPPORT">SUPPORT</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-[2]">
                      Authorize Identity
                    </button>
                  </div>
                </form>
              </>
            )}

            {showEditModal && (
              <>
                <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-8">
                  Refine Identity
                </h3>
                <form onSubmit={handleEdit} className="space-y-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Identity Name
                    </label>
                    <input
                      type="text"
                      value={showEditModal.name}
                      onChange={(e) =>
                        setShowEditModal({
                          ...showEditModal,
                          name: e.target.value,
                        })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-blue)] outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                      Clearance Tier
                    </label>
                    <select
                      value={showEditModal.role}
                      onChange={(e) =>
                        setShowEditModal({
                          ...showEditModal,
                          role: e.target.value,
                        })
                      }
                      className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-5 text-sm font-black text-black focus:border-[var(--brand-blue)] outline-none"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="SUPPORT">SUPPORT</option>
                    </select>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(null)}
                      className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary flex-[2]">
                      Sync Overrides
                    </button>
                  </div>
                </form>
              </>
            )}

            {showViewModal && (
              <>
                <h3 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
                  Identity Vault
                </h3>
                <div className="space-y-6 mb-10">
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-[var(--border)]">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Clearance
                      </p>
                      <p className="text-sm font-black text-[var(--brand-blue)]">
                        {showViewModal.role}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                        Protocol Status
                      </p>
                      <p className="text-sm font-black text-[var(--text-main)]">
                        {showViewModal.isSuspended
                          ? 'RESTRICTED'
                          : 'AUTHORIZED'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Full Identity
                    </p>
                    <p className="text-lg font-black text-[var(--text-main)] uppercase tracking-tight">
                      {showViewModal.name}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Uplink Gateway
                    </p>
                    <p className="text-sm font-black text-[var(--text-soft)]">
                      {showViewModal.email}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">
                      Registry Synchronization
                    </p>
                    <p className="text-xs font-bold text-[var(--text-muted)]">
                      {showViewModal.createdAt
                        ? new Date(showViewModal.createdAt).toLocaleString()
                        : 'Sync Date Unknown'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(null)}
                  className="btn btn-primary w-full shadow-lg"
                >
                  Close Vault
                </button>
              </>
            )}
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
