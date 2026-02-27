// FILE: src/pages/patient/MyAppointments.jsx
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { FaPlusCircle, FaTrash, FaVideo, FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoCallModal from "./VideoCallModal"; // Import VideoCallModal

// Use the same component as BookAppointment for consistent slot logic
import BookingSlots from "../../components/BookingSlots";

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
  const [rescheduleId, setRescheduleId] = useState(null);

  // Video Call State
  const [videoCallData, setVideoCallData] = useState(null);

  // Updated state for slot-based booking
  const [form, setForm] = useState({
    doctorId: "",
    appointmentDate: "", // Selected Date (YYYY-MM-DD)
    selectedSlotId: "", // ID of the chosen slot
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

  // Handle slot selection from BookingSlots component
  const handleSlotSelect = (slot) => {
    setForm((prev) => ({ ...prev, selectedSlotId: slot.id }));
  };

  const handleUpdate = (appt) => {
    setRescheduleId(appt.id);
    setForm((prev) => ({
      ...prev,
      doctorId: appt.doctorId,
      appointmentDate: "",
      selectedSlotId: "",
      reason: appt.reason || "",
    }));
    // We need to trigger doctor loading if not already loaded, but for now assuming user clicks the button
    // which usually happens after page load where doctors might not be fully loaded if we lazy load.
    // However, loadDoctors() is called on "Book New" button. We should probably call it here too or ensure it's loaded.
    // The "Book New" button calls loadDoctors(). Let's call it here to be safe.
    loadDoctors().then(() => setBookOpen(true));
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();

    if (!form.selectedSlotId) {
      toast.error("Please select an available time slot");
      return;
    }

    try {
      // Use the robust slot booking endpoint that handles locking and validation
      await api.post("/schedule/book", {
        startTime: form.selectedSlotId, // ID is now ISO time
        doctorId: form.doctorId,
        patientId: patientUserId,
        reason: form.reason || "Patient Booking",
      });

      if (rescheduleId) {
        await api.patch(`/patient/appointments/${rescheduleId}/cancel`);
        toast.success("Appointment rescheduled successfully!");
      } else {
        toast.success("Appointment booked successfully!");
      }

      setBookOpen(false);
      setRescheduleId(null);
      setForm({ doctorId: "", appointmentDate: "", selectedSlotId: "", reason: "" });
      await fetchAppointments();
    } catch (err) {
      console.error("Booking error:", err);
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

  // Check if call is allowed
  const handleStartVideo = (appt) => {
    const now = new Date();
    // Use startTime/endTime if available, otherwise fall back to appointmentDate + 15m
    const start = appt.startTime ? new Date(appt.startTime) : new Date(appt.appointmentDate);
    const end = appt.endTime ? new Date(appt.endTime) : new Date(start.getTime() + 15 * 60000);

    // Buffer: Allow 2 mins early
    const authorizedStart = new Date(start.getTime() - 2 * 60000);

    if (now < authorizedStart) {
      toast.warn(`Session locked. Please wait until ${start.toLocaleTimeString()}`);
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
                          {(a.status === "PENDING" || a.status === "APPROVED") && (
                            <>
                              <button
                                onClick={() => handleUpdate(a)}
                                className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-white transition-all"
                                title="Reschedule / Update"
                              >
                                <FaEdit size={14} />
                              </button>
                              <button
                                onClick={() => askCancel(a.id)}
                                className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Cancel Appointment"
                              >
                                <FaTrash size={14} />
                              </button>
                            </>
                          )}
                          {a.status === "APPROVED" && (
                            <button
                              onClick={() => handleStartVideo(a)}
                              className="p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                              title="Join Video Consultation"
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
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6">
              {rescheduleId ? "Reschedule Appointment" : "Book Appointment"}
            </h2>
            <form onSubmit={handleBookSubmit} className="space-y-4">
              {/* Doctor Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                  Select Doctor
                </label>
                <select
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none text-[var(--text-main)]"
                  value={form.doctorId}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      doctorId: e.target.value,
                      appointmentDate: "",
                      selectedSlotId: "",
                    })
                  }
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

              {/* Date Selection */}
              {form.doctorId && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none text-[var(--text-main)]"
                    value={form.appointmentDate}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appointmentDate: e.target.value,
                        selectedSlotId: "",
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              )}

              {/* Available Slots */}
              {form.doctorId && form.appointmentDate && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Select Time Slot
                  </label>
                  <BookingSlots
                    doctorId={form.doctorId}
                    date={new Date(form.appointmentDate)}
                    onSlotSelect={handleSlotSelect}
                  />
                  {/* Visual feedback for selected slot */}
                  {form.selectedSlotId && (
                    <p className="text-xs text-[var(--brand-green)] mt-2 font-bold px-1">
                      ✓ Slot selected
                    </p>
                  )}
                </div>
              )}

              {/* Reason */}
              {form.selectedSlotId && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">
                    Reason for consultation
                  </label>
                  <textarea
                    className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-xs font-bold focus:border-[var(--brand-green)] outline-none h-24 text-[var(--text-main)]"
                    value={form.reason}
                    onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    placeholder="Describe your symptoms..."
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setBookOpen(false);
                    setRescheduleId(null);
                    setForm({ doctorId: "", appointmentDate: "", selectedSlotId: "", reason: "" });
                  }}
                  className="btn flex-1 bg-[var(--bg-main)] border border-[var(--border)] text-[var(--text-soft)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!form.selectedSlotId}
                  className={`btn flex-[2] ${
                    !form.selectedSlotId
                      ? "bg-gray-600 cursor-not-allowed opacity-50"
                      : "btn-primary"
                  }`}
                >
                  {rescheduleId ? "Confirm Helper" : "Initialize Booking"}
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

      {/* Video Call Modal */}
      {videoCallData && (
        <VideoCallModal consultation={videoCallData} onClose={() => setVideoCallData(null)} />
      )}

      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
