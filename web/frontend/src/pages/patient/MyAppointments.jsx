// FILE: src/pages/patient/MyAppointments.jsx
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../Lib/api";
import { FaPlusCircle, FaTrash, FaVideo, FaEdit, FaPhoneAlt, FaSpinner } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Use the same component as BookAppointment for consistent slot logic
import BookingSlots from "../../components/BookingSlots";

export default function MyAppointments() {
  const role = "PATIENT";
  const patientUserId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState([]);
  const [bookOpen, setBookOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toCancelId, setToCancelId] = useState(null);
  const [rescheduleId, setRescheduleId] = useState(null);
  const [joiningCallId, setJoiningCallId] = useState(null);

  // Track previous callStatus to detect transitions
  const prevCallStatuses = useRef({});

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

  // ========== POLLING: Check callStatus every 5 seconds ==========
  useEffect(() => {
    const approvedIds = appointments
      .filter((a) => a.status === "APPROVED" && (a.callStatus || "idle") !== "ended")
      .map((a) => a.id);

    if (approvedIds.length === 0) return;

    const pollStatuses = async () => {
      try {
        const updates = await Promise.allSettled(
          approvedIds.map((id) => api.get(`/appointments/${id}/status`))
        );

        setAppointments((prev) =>
          prev.map((a) => {
            const match = updates.find(
              (u) => u.status === "fulfilled" && u.value.data.appointmentId === a.id
            );
            if (match) {
              const newStatus = match.value.data.callStatus;
              const oldStatus = prevCallStatuses.current[a.id] || a.callStatus || "idle";

              // Detect transition to "requested" — show notification
              if (oldStatus !== "requested" && newStatus === "requested") {
                toast.info("📞 Doctor is calling you! Click Join to connect.", {
                  autoClose: false,
                  toastId: `call-${a.id}`,
                });
              }

              prevCallStatuses.current[a.id] = newStatus;
              return { ...a, callStatus: newStatus };
            }
            return a;
          })
        );
      } catch (err) {
        // Silent polling failure
      }
    };

    // Run once immediately
    pollStatuses();

    const interval = setInterval(pollStatuses, 5000);
    return () => clearInterval(interval);
  }, [appointments.length]);

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

  // ========== NEW: Join Video Call via API ==========
  const handleJoinCall = async (appt) => {
    try {
      setJoiningCallId(appt.id);

      const res = await api.post(`/appointments/${appt.id}/join-call`);

      if (res.data.success) {
        toast.success("Joining video session...");
        // Dismiss the call notification toast
        toast.dismiss(`call-${appt.id}`);
        navigate(`/call/${appt.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to join call";
      toast.error(msg);
    } finally {
      setJoiningCallId(null);
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

  // Render video/call button based on callStatus
  const renderCallButton = (appt) => {
    if (appt.status !== "APPROVED") return null;

    const cs = (appt.callStatus || "idle").toLowerCase();
    const isJoining = joiningCallId === appt.id;

    switch (cs) {
      case "idle":
        return (
          <button
            disabled
            className="p-2 rounded-xl bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-50"
            title="Waiting for doctor to start the session"
          >
            <FaVideo size={14} />
          </button>
        );
      case "requested":
        return (
          <button
            onClick={() => handleJoinCall(appt)}
            disabled={isJoining}
            className="p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-all animate-pulse ring-2 ring-green-500/30"
            title="Doctor is calling — Join Video Call"
          >
            {isJoining ? (
              <FaSpinner size={14} className="animate-spin" />
            ) : (
              <FaPhoneAlt size={14} />
            )}
          </button>
        );
      case "active":
        return (
          <button
            onClick={() => navigate(`/call/${appt.id}`)}
            className="p-2 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all"
            title="Rejoin Active Session"
          >
            <FaVideo size={14} />
          </button>
        );
      case "ended":
        return (
          <button
            disabled
            className="p-2 rounded-xl bg-gray-500/10 text-gray-500 cursor-not-allowed opacity-50"
            title="Session ended"
          >
            <FaVideo size={14} />
          </button>
        );
      default:
        return null;
    }
  };

  // Render inline call notification banner
  const renderCallBanner = (appt) => {
    const cs = (appt.callStatus || "idle").toLowerCase();
    if (appt.status !== "APPROVED") return null;

    switch (cs) {
      case "idle":
        return (
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">
            Awaiting doctor
          </div>
        );
      case "requested":
        return (
          <div className="text-[9px] font-black uppercase tracking-widest text-green-400 mt-1 animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            Doctor is calling...
          </div>
        );
      case "active":
        return (
          <div className="text-[9px] font-black uppercase tracking-widest text-green-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            In session
          </div>
        );
      case "ended":
        return (
          <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mt-1">
            Session ended
          </div>
        );
      default:
        return null;
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

        {/* Incoming Call Banner — shown at top when any appointment has a call request */}
        {appointments.some((a) => a.status === "APPROVED" && a.callStatus === "requested") && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl animate-pulse">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <FaPhoneAlt className="text-green-400 animate-bounce" />
                </div>
                <div>
                  <p className="text-sm font-black text-green-400 uppercase tracking-widest">
                    Incoming Call
                  </p>
                  <p className="text-xs font-bold text-[var(--text-soft)]">
                    Your doctor is waiting — click the phone icon below to join
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                    <tr
                      key={a.id}
                      className={`hover:bg-[var(--bg-main)]/30 transition-colors ${
                        a.callStatus === "requested" ? "bg-green-500/5" : ""
                      }`}
                    >
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
                        {renderCallBanner(a)}
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
                          {/* Call-Status Aware Video Button */}
                          {renderCallButton(a)}
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
          <div onClick={() => setBookOpen(false)}></div>
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
