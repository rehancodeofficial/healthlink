// FILE: src/pages/doctor/DoctorAppointments.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaCalendarAlt,
  FaClock,
  FaVideo, // Import FaVideo
} from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoCallModal from "../patient/VideoCallModal"; // Import shared VideoCallModal

const StatusPill = ({ status }) => {
  const s = (status || "").toUpperCase();
  const base = "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border";
  switch (s) {
    case "COMPLETED":
      return <span className={`${base} bg-blue-500/20 text-blue-500 border-blue-500/30`}>{s}</span>;
    case "PENDING":
      return (
        <span className={`${base} bg-orange-500/20 text-orange-500 border-orange-500/30`}>{s}</span>
      );
    case "APPROVED":
      return (
        <span className={`${base} bg-green-500/20 text-green-500 border-green-500/30`}>{s}</span>
      );
    case "CANCELLED":
      return <span className={`${base} bg-red-500/20 text-red-500 border-red-500/30`}>{s}</span>;
    default:
      return <span className={`${base} bg-gray-500/20 text-gray-400 border-gray-500/30`}>{s}</span>;
  }
};

export default function DoctorAppointments() {
  const doctorUserId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";
  const user = { id: doctorUserId, name: userName };

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Video Call State
  const [videoCallData, setVideoCallData] = useState(null);

  const [form, setForm] = useState({
    patientId: "",
    appointmentDate: "",
    reason: "",
    status: "PENDING",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyPatients = useCallback(async () => {
    try {
      setPatientsLoading(true);
      const res = await api.get("/doctor/my-patients", {
        params: { doctorId: doctorUserId },
      });
      setPatients(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error loading patients");
    } finally {
      setPatientsLoading(false);
    }
  }, [doctorUserId]);

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/doctor/appointments", {
        params: { doctorId: doctorUserId },
      });
      setAppointments(res.data || []);
    } catch (err) {
      setError("Failed to load clinical schedule.");
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  useEffect(() => {
    fetchMyPatients();
    fetchAppointments();
  }, [fetchMyPatients, fetchAppointments]);

  const hasPatients = useMemo(() => patients.length > 0, [patients]);

  const openNewModal = () => {
    setSelectedAppointment(null);
    setEditing(false);
    setViewMode(false);
    setForm({
      patientId: "",
      appointmentDate: "",
      reason: "",
      status: "PENDING",
    });
    setModalOpen(true);
  };

  const openViewModal = (appt) => {
    setSelectedAppointment(appt);
    setViewMode(true);
    setEditing(false);
    setModalOpen(true);
  };

  const openEditModal = (appt) => {
    setSelectedAppointment(appt);
    setEditing(true);
    setViewMode(false);
    setForm({
      patientId: appt?.patientId || "",
      appointmentDate: appt?.appointmentDate
        ? new Date(appt.appointmentDate).toISOString().slice(0, 16)
        : "",
      reason: appt?.reason || "",
      status: appt?.status || "PENDING",
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing && selectedAppointment?.id) {
        await api.patch(`/doctor/appointments/${selectedAppointment.id}`, {
          ...form,
          doctorId: doctorUserId,
        });
        toast.success("Schedule Updated");
      } else {
        await api.post(`/doctor/appointments`, {
          ...form,
          doctorId: doctorUserId,
        });
        toast.success("Protocol Registered");
      }
      setModalOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error("Protocol Sync Failed");
    }
  };

  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/doctor/appointments/${pendingDeleteId}`);
      toast.success("Data Purged");
      setConfirmOpen(false);
      fetchAppointments();
    } catch (err) {
      toast.error("Purge Failed");
    } finally {
      setDeleting(false);
    }
  };

  // Check if call is allowed
  const handleStartVideo = (appt) => {
    // Doctors might have broader access, but let's stick to the schedule for now
    const now = new Date();
    const start = appt.startTime ? new Date(appt.startTime) : new Date(appt.appointmentDate);
    const end = appt.endTime ? new Date(appt.endTime) : new Date(start.getTime() + 15 * 60000);

    // Buffer: Allow 5 mins early for doctors to prep
    const authorizedStart = new Date(start.getTime() - 5 * 60000);

    // Override: If doctor manually clicks, we can be lenient or strict.
    // Let's be lenient for doctors: they can join anytime on the day of appointment?
    // Or stick to the slot requirement "video consultation must automatically start within that same booked slot time."
    // I'll stick to the buffer logic.

    if (now < authorizedStart) {
      toast.warn(`Session locked. Opens at ${authorizedStart.toLocaleTimeString()}`);
      return;
    }

    if (now > end) {
      toast.error("Session expired.");
      return;
    }

    setVideoCallData({
      id: appt.id,
      roomName: `consult_${appt.id}`,
      durationMins: 15,
    });
  };

  return (
    <DashboardLayout role="DOCTOR" user={user}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.3em] mb-1">
              Clinical Schedule
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              Appointments
            </h1>
          </div>
          <button onClick={openNewModal} className="btn btn-primary" disabled={!hasPatients}>
            <FaPlus /> New Protocol
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
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
                    Time Protocol
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Objective
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-main)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse"
                    >
                      Scanning Grid...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      Protocol Clear. No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-[var(--bg-main)]/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {a?.patient?.user
                          ? `${a.patient.user.firstName} ${a.patient.user.lastName}`
                          : a?.patientName || "IDENTITY_UNKNOWN"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--text-main)] flex items-center gap-2">
                            <FaCalendarAlt className="text-[var(--brand-green)] text-[10px]" />
                            {a?.appointmentDate
                              ? new Date(a.appointmentDate).toLocaleDateString()
                              : "—"}
                          </span>
                          <span className="text-[10px] font-mono text-[var(--brand-blue)] flex items-center gap-2">
                            <FaClock className="text-[10px]" />
                            {a?.appointmentDate
                              ? new Date(a.appointmentDate).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: false,
                                })
                              : "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)] truncate max-w-[200px]">
                        {a?.reason || "General Observation"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={a?.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {/* Video Button */}
                          {a?.status === "APPROVED" && (
                            <button
                              onClick={() => handleStartVideo(a)}
                              className="p-2 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all"
                              title="Access Video Link"
                            >
                              <FaVideo size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => openViewModal(a)}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all"
                          >
                            <FaEye size={14} />
                          </button>
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-2 rounded-xl bg-[var(--brand-green)]/10 text-[var(--brand-green)] hover:bg-[var(--brand-green)] hover:text-[var(--text-main)] transition-all"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => requestDelete(a.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all"
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
            className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              {viewMode ? "Protocol View" : editing ? "Sync Protocol" : "Initialize Protocol"}
            </h2>
            {viewMode ? (
              <div className="space-y-6 text-[var(--text-main)] text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Subject
                    </p>
                    <p className="text-[var(--text-main)]">
                      {selectedAppointment?.patient?.user
                        ? `${selectedAppointment.patient.user.firstName} ${selectedAppointment.patient.user.lastName}`
                        : "IDENTITY_UNKNOWN"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                      Protocol Date
                    </p>
                    <p className="text-[var(--text-main)]">
                      {selectedAppointment?.appointmentDate
                        ? new Date(selectedAppointment.appointmentDate).toLocaleString("en-GB", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Objective
                  </p>
                  <p className="text-[var(--text-soft)] bg-[var(--bg-main)]/50 p-4 rounded-xl border border-[var(--border)]">
                    {selectedAppointment?.reason || "General Consultation."}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Status
                  </p>
                  <StatusPill status={selectedAppointment?.status} />
                </div>
                <button onClick={() => setModalOpen(false)} className="btn btn-primary w-full mt-4">
                  Close Vault
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-[var(--text-main)]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Select Subject
                  </label>
                  <select
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none text-black"
                    value={form.patientId}
                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                    required
                  >
                    <option value="">-- Choose Subject --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name || p.user?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 text-[var(--text-main)]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Protocol Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none text-[var(--text-main)]"
                    value={form.appointmentDate}
                    onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5 text-[var(--text-main)]">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Case Notes
                  </label>
                  <textarea
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24 text-[var(--text-main)]"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Input clinical objectives..."
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
                    {editing ? "Update Protocol" : "Sync Protocol"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-md glass !p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Delete Protocol?
            </h3>
            <p className="text-sm font-bold text-[var(--text-soft)] mb-8 uppercase tracking-widest opacity-70 italic">
              Critical Data Loss Expected.
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
                disabled={deleting}
              >
                {deleting ? "Purging..." : "Confirm Deletion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {videoCallData && (
        <VideoCallModal
          consultation={videoCallData}
          onClose={() => setVideoCallData(null)}
          role="DOCTOR"
        />
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
