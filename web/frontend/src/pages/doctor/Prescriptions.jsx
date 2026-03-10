// FILE: src/pages/doctor/Prescriptions.jsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaFileMedical,
  FaPrescriptionBottleAlt,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({
    patientId: '',
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const doctorUserId = localStorage.getItem('userId');
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Doctor';

  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/doctor/prescriptions`, {
        params: { doctorId: doctorUserId },
      });
      setPrescriptions(res.data || []);
      setError('');
    } catch (err) {
      setError('Failed to sync clinical scripts.');
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  const fetchMyPatients = useCallback(async () => {
    try {
      const res = await api.get('/doctor/my-patients', {
        params: { doctorId: doctorUserId },
      });
      setPatients(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Error loading registry.');
    }
  }, [doctorUserId]);

  useEffect(() => {
    fetchPrescriptions();
    fetchMyPatients();
  }, [fetchPrescriptions, fetchMyPatients]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/doctor/prescriptions', {
        ...form,
        doctorId: doctorUserId,
      });
      toast.success('Protocol Registered.');
      setModalOpen(false);
      setForm({
        patientId: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: '',
      });
      fetchPrescriptions();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Sync Failed.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/doctor/prescriptions/${selectedPrescription.id}`, {
        ...form,
      });
      toast.success('Protocol Refined.');
      setEditModal(false);
      fetchPrescriptions();
    } catch (err) {
      toast.error('Refinement Failed.');
    }
  };

  const confirmDelete = async () => {
    try {
      setConfirmLoading(true);
      await api.delete(`/doctor/prescriptions/${pendingDeleteId}`);
      toast.success('Identity Purged.');
      setConfirmOpen(false);
      fetchPrescriptions();
    } catch (err) {
      toast.error('Purge Aborted.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <DashboardLayout role="DOCTOR" user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
              Fulfillment Protocol
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              Prescriptions
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            disabled={patients.length === 0}
            className="btn btn-primary"
          >
            <FaPlus /> Authorize Script
          </button>
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
                    Subject
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Medication
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Dosage
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Cycle
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Auth Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Protocol Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse"
                    >
                      Accessing Crypto-records...
                    </td>
                  </tr>
                ) : prescriptions.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      No active scripts identified.
                    </td>
                  </tr>
                ) : (
                  prescriptions.map((p) => (
                    <tr
                      key={p.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {p.patient?.user?.name || 'IDENTITY_REDACTED'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {p.medication}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-[var(--brand-blue)]">
                        {p.dosage}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {p.frequency} / {p.duration}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-bold text-[var(--text-muted)]">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleDateString()
                          : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelectedPrescription(p);
                              setViewModal(true);
                            }}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPrescription(p);
                              setForm(p);
                              setEditModal(true);
                            }}
                            className="p-2 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setPendingDeleteId(p.id);
                              setConfirmOpen(true);
                            }}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all shadow-sm"
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

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              <FaPrescriptionBottleAlt className="text-[var(--brand-blue)]" />{' '}
              Authorize Protocol
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Target Subject
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-black"
                  value={form.patientId}
                  onChange={(e) =>
                    setForm({ ...form, patientId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.user?.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Medication Identity
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                  value={form.medication}
                  onChange={(e) =>
                    setForm({ ...form, medication: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.dosage}
                    onChange={(e) =>
                      setForm({ ...form, dosage: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({ ...form, frequency: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Protocol Notes
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-[2]">
                  Establish Auth
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setEditModal(false)}
          ></div>
          <div className="animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              Refine Protocol
            </h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Medication Identity
                </label>
                <input
                  type="text"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                  value={form.medication}
                  onChange={(e) =>
                    setForm({ ...form, medication: e.target.value })
                  }
                  required
                />
              </div>
              {/* Similar fields... truncated for brevity but fully implemented in rewrite */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.dosage}
                    onChange={(e) =>
                      setForm({ ...form, dosage: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Frequency
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.frequency}
                    onChange={(e) =>
                      setForm({ ...form, frequency: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.duration}
                    onChange={(e) =>
                      setForm({ ...form, duration: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Protocol Notes
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModal(false)}
                  className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-[2]">
                  Sync Refinement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewModal && selectedPrescription && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            onClick={() => setViewModal(false)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              <FaFileMedical className="text-[var(--brand-green)]" /> Protocol
              Identity
            </h2>
            <div className="space-y-6 text-[var(--text-main)] text-xs font-bold">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Subject ID
                  </p>
                  <p className="text-[var(--text-main)]">
                    {selectedPrescription.patient?.user?.name ||
                      'IDENTITY_REDACTED'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Auth Log
                  </p>
                  <p className="text-[var(--text-main)]">
                    {new Date(selectedPrescription.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Medication
                  </p>
                  <p className="text-[var(--brand-blue)]">
                    {selectedPrescription.medication}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Dosage Protocol
                  </p>
                  <p className="text-[var(--text-main)]">
                    {selectedPrescription.dosage}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Clinical Notes
                </p>
                <p className="text-[var(--text-soft)] bg-[var(--bg-main)]/50 p-4 rounded-xl border border-[var(--border)] leading-relaxed">
                  {selectedPrescription.notes ||
                    'No special instructions logged.'}
                </p>
              </div>
              <button
                onClick={() => setViewModal(false)}
                className="btn btn-primary w-full shadow-lg"
              >
                Close Log
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass !p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Purge Clinical Record?
            </h3>
            <p className="text-sm font-bold text-[var(--text-soft)] mb-8 uppercase tracking-widest opacity-70 italic">
              This will permanently delete the script.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
              >
                Abort
              </button>
              <button
                onClick={confirmDelete}
                className="btn bg-red-500 text-[var(--text-main)] flex-[2] hover:bg-red-600 disabled:opacity-50"
                disabled={confirmLoading}
              >
                {confirmLoading ? 'Purging...' : 'Confirm Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
