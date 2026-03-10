// FILE: src/pages/patient/VideoConsultation.jsx
import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import VideoCallModal from './VideoCallModal';
import {
  FaPlusCircle,
  FaVideo,
  FaTimesCircle,
  FaCheckCircle,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const StatusPill = ({ status }) => {
  const s = (status || '').toUpperCase();
  const base =
    'px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border';
  switch (s) {
    case 'SCHEDULED':
      return (
        <span
          className={`${base} bg-orange-500/20 text-orange-500 border-orange-500/30`}
        >
          {s}
        </span>
      );
    case 'ONGOING':
      return (
        <span
          className={`${base} bg-blue-500/20 text-blue-500 border-blue-500/30 animate-pulse`}
        >
          {s}
        </span>
      );
    case 'COMPLETED':
      return (
        <span
          className={`${base} bg-green-500/20 text-green-500 border-green-500/30`}
        >
          {s}
        </span>
      );
    default:
      return (
        <span
          className={`${base} bg-red-500/20 text-red-500 border-red-500/30`}
        >
          {s}
        </span>
      );
  }
};

export default function VideoConsultation() {
  const role = 'PATIENT';
  const patientUserId = localStorage.getItem('userId');
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Patient';

  const [consultations, setConsultations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form, setForm] = useState({
    doctorId: '',
    scheduledAt: '',
    durationMins: 30,
  });

  const loadAssignedDoctors = useCallback(async () => {
    try {
      const res = await api.get('/patient/doctors', {
        params: { patientUserId },
      });
      setDoctors(res.data?.data || res.data || []);
    } catch (err) {
      setError('Failed to load clinical staff.');
    }
  }, [patientUserId]);

  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/videocall/list`, {
        params: { userId: patientUserId, role: 'PATIENT' },
      });
      const data = res.data?.data || res.data || [];
      setConsultations(
        data.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt))
      );
    } catch (err) {
      setError('Failed to sync consultation logs.');
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  useEffect(() => {
    fetchConsultations();
    loadAssignedDoctors();
  }, [fetchConsultations, loadAssignedDoctors]);

  const handleSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        role: 'PATIENT',
        userId: patientUserId,
        patientId: patientUserId,
        doctorId: form.doctorId,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMins: Number(form.durationMins) || 30,
      };
      await api.post('/videocall/create', payload);
      toast.success('Protocol Hooked.');
      setModalOpen(false);
      fetchConsultations();
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Sync Failed.');
    }
  };

  const confirmCancel = async () => {
    try {
      setConfirmLoading(true);
      await api.put(`/videocall/status/${pendingCancelId}`, {
        status: 'CANCELLED',
      });
      toast.success('Protocol Terminated.');
      setConfirmOpen(false);
      fetchConsultations();
    } catch (err) {
      toast.error('Termination Failed.');
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
              Virtual Clinic
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              Video Consultations
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="btn btn-primary"
          >
            <FaPlusCircle /> Initialize Session
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
                    Subject Doctor
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Time Slot
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Window
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Status
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
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      Linking with central hub...
                    </td>
                  </tr>
                ) : consultations.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      No consultation history found.
                    </td>
                  </tr>
                ) : (
                  consultations.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {c.doctor?.user?.name || 'IDENTITY_REDACTED'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                            <FaCalendarAlt className="text-[var(--brand-blue)] text-[10px]" />
                            {c.scheduledAt
                              ? new Date(c.scheduledAt).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono font-bold text-[var(--brand-blue)]">
                        {c.durationMins || 30} MINS
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={c.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-4">
                          {c.status === 'SCHEDULED' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedConsultation(c);
                                  setCallModalOpen(true);
                                }}
                                className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                                title="Enter Hub"
                              >
                                <FaVideo size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  setPendingCancelId(c.id);
                                  setConfirmOpen(true);
                                }}
                                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                                title="Abort Protocol"
                              >
                                <FaTimesCircle size={14} />
                              </button>
                            </>
                          )}
                          {c.status === 'COMPLETED' && (
                            <FaCheckCircle className="text-[var(--brand-green)]" />
                          )}
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
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              Initialize Hub Session
            </h2>
            <form onSubmit={handleSchedule} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Select Specialist
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-black"
                  value={form.doctorId}
                  onChange={(e) =>
                    setForm({ ...form, doctorId: e.target.value })
                  }
                  required
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.user?.name || 'Doctor'} —{' '}
                      {d.specialization || 'General'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Synchronization Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                  value={form.scheduledAt}
                  onChange={(e) =>
                    setForm({ ...form, scheduledAt: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Window duration (Minutes)
                </label>
                <input
                  type="number"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)]"
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm({ ...form, durationMins: e.target.value })
                  }
                  required
                />
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
                  Establish Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="relative w-full max-w-md glass !p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Abort Protocol?
            </h3>
            <p className="text-sm font-bold text-[var(--text-soft)] mb-8 uppercase tracking-widest opacity-70 italic">
              Consultation will be terminated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
              >
                Retain
              </button>
              <button
                onClick={confirmCancel}
                className="btn bg-red-500 text-[var(--text-main)] flex-[2] hover:bg-red-600 disabled:opacity-50"
                disabled={confirmLoading}
              >
                {confirmLoading ? 'Aborting...' : 'Terminate Link'}
              </button>
            </div>
          </div>
        </div>
      )}

      {callModalOpen && selectedConsultation && (
        <VideoCallModal
          consultation={selectedConsultation}
          onClose={() => setCallModalOpen(false)}
        />
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
