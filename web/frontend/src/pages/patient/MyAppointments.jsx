// FILE: src/pages/patient/MyAppointments.jsx
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { FaPlusCircle, FaTrash, FaVideo, FaCalendarAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyAppointments() {
  const role = "PATIENT";
  const patientUserId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancelId, setToCancelId] = useState(null);
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "",
    reason: "",
  });

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/patient/appointments", {
        params: { patientId: patientUserId },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setAppointments(data);
    } catch (err) {
      console.error("❌ Error loading appointments:", err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [patientUserId]);

  const loadDoctors = useCallback(async () => {
    try {
      const res = await api.get("/patient/doctors/all");
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setDoctors(
        list.map((d) => ({
          id: d.id,
          name: d.user
            ? `${d.user.firstName} ${d.user.lastName}`.trim() || "Unnamed Doctor"
            : "Unnamed Doctor",
          specialization: d.specialization || "General",
        }))
      );
    } catch (err) {
      console.error("Error loading doctors:", err);
      toast.error("Failed to load doctors");
    }
  }, []);

  useEffect(() => {
    if (patientUserId) fetchAppointments();
  }, [fetchAppointments, patientUserId]);

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    try {
      const isoDate = new Date(form.appointmentDate).toISOString();
      await api.post("/patient/appointments", {
        doctorId: form.doctorId,
        appointmentDate: isoDate,
        reason: form.reason || null,
        patientId: patientUserId,
      });
      toast.success("Appointment booked successfully!");
      setBookOpen(false);
      setForm({ doctorId: "", appointmentDate: "", reason: "" });
      await fetchAppointments();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to book appointment");
    }
  };

  const askCancel = (id) => {
    setToCancelId(id);
    setConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!toCancelId) return;
    try {
      await api.patch(`/patient/appointments/${toCancelId}/cancel`);
      toast.success("Appointment cancelled");
      setConfirmOpen(false);
      setToCancelId(null);
      await fetchAppointments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-500 border border-green-500/30";
      case "PENDING":
        return "bg-orange-500/20 text-orange-500 border border-orange-500/30";
      case "COMPLETED":
        return "bg-blue-500/20 text-blue-500 border border-blue-500/30";
      case "CANCELLED":
        return "bg-red-500/20 text-red-500 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-500 border border-gray-500/30";
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.3em] mb-1">
              Clinical Schedule
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter">
              My Appointments
            </h1>
          </div>
          <button
            onClick={async () => {
              await loadDoctors();
              setBookOpen(true);
            }}
            className="btn btn-primary"
          >
            <FaPlusCircle /> Book New
          </button>
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Doctor
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Specialization
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Date
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Actions
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
                      Loading appointments...
                    </td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)]"
                    >
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((a) => (
                    <tr key={a.id} className="hover:bg-[var(--bg-main)]/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                        {a.doctor?.user
                          ? `${a.doctor.user.firstName} ${a.doctor.user.lastName}`.trim()
                          : "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                        {a.doctor?.specialization || "General"}
                      </td>
                      <td className="px-6 py-4">
                        {a.appointmentDate ? (
                          <div className="space-y-0.5">
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                              {new Date(a.appointmentDate).toLocaleDateString("en-US", {
                                weekday: "long",
                              })}
                            </div>
                            <div className="text-xs font-mono font-bold text-[var(--brand-blue)]">
                              {new Date(a.appointmentDate).toLocaleString("en-GB", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              })}
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusColor(
                            a.status
                          )}`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-3">
                          {a.status === "PENDING" && (
                            <button
                              onClick={() => askCancel(a.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all"
                            >
                              <FaTrash size={14} />
                            </button>
                          )}
                          {a.status === "APPROVED" && (
                            <button
                              onClick={() => toast.info("Starting video...")}
                              className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-[var(--text-main)] transition-all"
                            >
                              <FaVideo size={14} />
                            </button>
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

      {bookOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm"
            onClick={() => setBookOpen(false)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              Book Appointment
            </h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Select Doctor
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Specialist --</option>
                  {doctors.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name} — {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none"
                  value={form.appointmentDate}
                  onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Reason for consultation
                </label>
                <textarea
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  placeholder="Describe your symptoms..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setBookOpen(false)}
                  className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-[2]">
                  Initialize Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[var(--bg-main)]/80 backdrop-blur-sm"></div>
          <div className="relative w-full max-w-md glass !p-8 animate-in zoom-in-95 duration-300">
            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-2">
              Cancel Appointment?
            </h3>
            <p className="text-sm font-bold text-[var(--text-soft)] mb-8 uppercase tracking-widest opacity-70 italic">
              This operation cannot be reversed.
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
                className="btn bg-red-500 text-[var(--text-main)] flex-[2] hover:bg-red-600"
              >
                Terminate Visit
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
