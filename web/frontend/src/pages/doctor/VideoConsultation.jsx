// FILE: src/pages/doctor/VideoConsultation.jsx
import { useState, useEffect, useCallback } from "react";
import api from "../../Lib/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import VideoCallModal from "./VideoCallModal";
import {
  FaPlusCircle,
  FaVideo,
  FaTimesCircle,
  FaCheckCircle,
} from "react-icons/fa";

/* ------------------- Tiny toast (success/error) ------------------- */
function Toast({ text, onClose }) {
  if (!text) return null;
  return (
    <div
      className="fixed top-6 right-6 bg-[var(--brand-green)] text-white px-5 py-3 rounded-lg shadow-lg z-50"
      style={{ animation: "fadeInOut 3s ease forwards" }}
      onAnimationEnd={onClose}
    >
      {text}
    </div>
  );
}

/* -- Inject keyframes once (safe no-op if already added) ----------- */
if (typeof document !== "undefined" && !document.getElementById("cv-fade-styles")) {
  const style = document.createElement("style");
  style.id = "cv-fade-styles";
  style.innerHTML = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }`;
  document.head.appendChild(style);
}

/* ------------------- Status pill component ------------------------ */
const StatusPill = ({ status }) => {
  const s = (status || "").toUpperCase();
  const styles =
    s === "SCHEDULED"
      ? "bg-[var(--brand-orange)] text-black"
      : s === "ONGOING"
      ? "bg-[var(--brand-blue)] text-white"
      : s === "COMPLETED"
      ? "bg-[var(--brand-green)] text-white"
      : "bg-red-600 text-white";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
      {s}
    </span>
  );
};

export default function VideoConsultation() {
  const role = localStorage.getItem("role") || "DOCTOR";
  const doctorUserId = localStorage.getItem("userId");
  const userName =
    localStorage.getItem("userName") ||
    localStorage.getItem("name") ||
    "Doctor";

  const [consultations, setConsultations] = useState([]);
  const [patients, setPatients] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);

  const [toastText, setToastText] = useState("");

  // Confirm cancel dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: "",
    scheduledAt: "",
    durationMins: 30,
  });

  /* ---------------------- Load my patients (requires doctorUserId) ------- */
  const loadMyPatients = useCallback(async () => {
    try {
      const res = await api.get("/doctor/patients", { params: { doctorUserId } });
      setPatients(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Error fetching patients:", err);
      setError("Failed to load your patients.");
    }
  }, [doctorUserId]);

  /* ---------------------- Load my consultations -------------------------- */
  const fetchConsultations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/videocall/list`, {
        params: { userId: doctorUserId, role: "DOCTOR" },
      });
      const data = res.data?.data || res.data || [];
      setConsultations(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("❌ Error fetching consultations:", err);
      setError("Failed to load consultations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  useEffect(() => {
    fetchConsultations();
    loadMyPatients();
  }, [fetchConsultations, loadMyPatients]);

  /* ---------------------- Schedule new consultation ---------------------- */
  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.scheduledAt) {
      setToastText("❗ Please fill all required fields.");
      return;
    }

    try {
      await api.post("/videocall/create", {
        doctorId: doctorUserId,        // send User.id, backend resolves DoctorProfile
        patientId: form.patientId,     // PatientProfile.id from dropdown
        scheduledAt: form.scheduledAt,
        durationMins: form.durationMins,
      });

      setToastText("✅ Consultation scheduled successfully!");
      setModalOpen(false);
      setForm({ patientId: "", scheduledAt: "", durationMins: 30 });
      fetchConsultations();
    } catch (err) {
      console.error("Error scheduling consultation:", err);
      setToastText(err?.response?.data?.error || "❌ Failed to schedule consultation.");
    }
  };

  /* ---------------------- Cancel consultation (confirm) ------------------ */
  const requestCancel = (id) => {
    setPendingCancelId(id);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!pendingCancelId) return;
    try {
      setConfirmLoading(true);
      await api.put(`/videocall/status/${pendingCancelId}`, {
        status: "CANCELLED",
      });
      setToastText("🛑 Consultation cancelled");
      setConfirmOpen(false);
      setPendingCancelId(null);
      fetchConsultations();
    } catch (err) {
      console.error("Error cancelling consultation:", err);
      setToastText("❌ Failed to cancel consultation.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const cancelConfirmDialog = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingCancelId(null);
  };

  /* ---------------------- Join consultation ------------------------------ */
  const handleJoin = (consultation) => {
    setSelectedConsultation(consultation);
    setCallModalOpen(true);
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
             <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 60, height: "auto" }}
              onError={(e) => {
                try { e.currentTarget.src = PLACEHOLDER_LOGO; } catch {}
              }}
            />
            <h1 className="text-3xl font-black text-[var(--text-main)] flex items-center gap-2 uppercase tracking-tighter">
              <FaVideo className="text-[var(--brand-green)]" /> Video Consultations
            </h1>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-[var(--brand-green)] hover:opacity-90 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl"
          >
            <FaPlusCircle /> Schedule New
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              {error}
            </p>
          </div>
        )}

        {loading ? (
           <div className="py-12 text-center text-[var(--text-soft)] font-bold animate-pulse uppercase tracking-widest text-xs">
              Loading consultations...
           </div>
        ) : consultations.length === 0 ? (
           <div className="py-12 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs border border-dashed border-[var(--border)] rounded-3xl">
              No consultations scheduled yet.
           </div>
        ) : (
          <div className="glass overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Patient</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Date</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Duration</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {consultations.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-main)]/50 transition"
                  >
                    <td className="p-4 text-sm font-bold text-[var(--text-main)]">
                      {c.patient?.user?.name || c.patient?.user?.fullName || "N/A"}
                    </td>
                    <td className="p-4 text-xs font-bold text-[var(--text-soft)]">
                      {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString('en-GB', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : "—"}
                    </td>
                    <td className="p-4 text-xs font-bold text-[var(--text-soft)]">{c.durationMins || 30} mins</td>
                    <td className="p-4">
                      <StatusPill status={c.status} />
                    </td>
                    <td className="p-4 flex justify-center gap-4">
                      {c.status === "SCHEDULED" && (
                        <>
                          <button
                            onClick={() => handleJoin(c)}
                            className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white transition shadow-sm"
                            title="Join Now"
                          >
                            <FaVideo />
                          </button>
                          <button
                            onClick={() => requestCancel(c.id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition shadow-sm"
                            title="Cancel"
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      {c.status === "COMPLETED" && (
                        <FaCheckCircle className="text-[var(--brand-green)]" title="Completed" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Toast */}
      <Toast text={toastText} onClose={() => setToastText("")} />

      {/* ✅ Cancel Confirm Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-[60]">
          <div className="bg-[var(--bg-card)] text-[var(--text-main)] w-full max-w-md rounded-[2rem] shadow-2xl p-8 relative border border-[var(--border)]">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Cancel Consultation?</h3>
            <p className="text-[var(--text-soft)] text-sm font-bold mb-8">
              This will set the consultation status to CANCELLED.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelConfirmDialog}
                className="px-6 py-3 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--text-main)] text-[10px] font-black uppercase tracking-widest transition disabled:opacity-50"
                disabled={confirmLoading}
              >
                Keep
              </button>
              <button
                onClick={confirmCancel}
                className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg disabled:opacity-50 transition"
                disabled={confirmLoading}
              >
                {confirmLoading ? "Processing..." : "Cancel Consultation"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Schedule Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50">
          <div className="bg-[var(--bg-card)] p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative border border-[var(--border)]">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-8 text-[var(--text-soft)] hover:text-[var(--text-main)] text-xl transition"
            >
              ✖
            </button>

            <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 text-[var(--text-main)]">
              Schedule Consultation
            </h2>

            <form onSubmit={handleSchedule} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">Patient</label>
                <select
                  className="w-full p-4 rounded-2xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-sm font-bold focus:border-[var(--brand-green)] outline-none shadow-inner transition"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                  required
                >
                  <option value="">-- Select Patient --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.user?.name || p.name || p.user?.email || "Unnamed Patient"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full p-4 rounded-2xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-sm font-bold focus:border-[var(--brand-green)] outline-none shadow-inner transition"
                  value={form.scheduledAt}
                  onChange={(e) => {
                    setForm({ ...form, scheduledAt: e.target.value });
                    e.target.blur();
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--brand-green)] ml-1">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  className="w-full p-4 rounded-2xl bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] text-sm font-bold focus:border-[var(--brand-green)] outline-none shadow-inner transition"
                  value={form.durationMins}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      durationMins: parseInt(e.target.value) || 30,
                    })
                  }
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[var(--brand-green)] hover:opacity-90 py-4.5 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition hover:-translate-y-1"
              >
                Schedule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🎥 Twilio/LiveKit Call Modal */}
      {callModalOpen && selectedConsultation && (
        <VideoCallModal
          consultation={selectedConsultation}
          onClose={() => setCallModalOpen(false)}
        />
      )}
    </DashboardLayout>
  );
}
