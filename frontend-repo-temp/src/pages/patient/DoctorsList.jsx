import { useCallback, useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaUserPlus, FaCalendarAlt } from "react-icons/fa";

const PLACEHOLDER_LOGO = "/images/logo/Asset3.png";

function DoctorViewModal({ open, onClose, doctor, onAssign, isAssigned }) {
  if (!open || !doctor) return null;

  const d = doctor; // DoctorProfile with embedded user
  const langs = safeParseArray(d.languages);

  const daysArr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  // Group schedules by day
  const groupedSchedules = (d.schedules || []).reduce((acc, s) => {
    const dayName = daysArr[s.dayOfWeek];
    if (!acc[dayName]) acc[dayName] = [];
    acc[dayName].push(s);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-[var(--bg-main)]/95 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] p-8 rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative text-[var(--text-main)] border border-[var(--border)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-main)] text-2xl transition"
          aria-label="Close modal"
        >
          ✖
        </button>

        <div className="flex items-center gap-4 mb-8">
          <img
            src="/images/logo/Asset3.png"
            alt="CureVirtual"
            className="w-24 h-auto"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_LOGO;
            }}
          />
          <div className="h-10 w-[1px] bg-white/20"></div>
          <h2 className="text-2xl font-bold text-[var(--text-main)]">Doctor Profile</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 text-[var(--text-soft)]">
          {/* Left Column: Basic Info */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-green)] mb-3">
                General Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-[var(--text-muted)]">Name:</span>{" "}
                  <span className="font-medium">
                    {d.user
                      ? `${d.user.firstName || ""} ${d.user.middleName || ""} ${d.user.lastName || ""}`.trim()
                      : "—"}
                  </span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Specialization:</span>{" "}
                  <span className="font-medium text-blue-300">{d.specialization || "—"}</span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Experience:</span>{" "}
                  <span className="font-medium">
                    {d.yearsOfExperience != null ? `${d.yearsOfExperience} years` : "—"}
                  </span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Fee:</span>{" "}
                  <span className="font-medium text-green-400">
                    {d.consultationFee != null ? `$${Number(d.consultationFee).toFixed(2)}` : "—"}
                  </span>
                </p>
                <p>
                  <span className="text-[var(--text-muted)]">Languages:</span>{" "}
                  <span>{langs.length ? langs.join(", ") : "—"}</span>
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-green)] mb-3">
                Bio
              </h3>
              <p className="text-sm leading-relaxed opacity-80 italic">
                {d.bio || "No biography provided."}
              </p>
            </div>
          </div>

          {/* Right Column: Schedule */}
          <div className="space-y-4">
            <div className="bg-[var(--bg-glass)] p-4 rounded-xl border border-white/5 h-full">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--brand-green)] mb-3 flex items-center gap-2">
                <FaCalendarAlt /> Weekly Schedule
              </h3>

              <div className="space-y-3">
                {d.schedules?.length > 0 ? (
                  daysArr.map((dayName) => {
                    const slots = groupedSchedules[dayName];
                    if (!slots) return null;
                    return (
                      <div key={dayName} className="border-b border-white/5 pb-2 last:border-0">
                        <p className="text-xs font-bold text-[var(--text-muted)] mb-1">{dayName}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots
                            .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
                            .map((s) => (
                              <span
                                key={s.id}
                                className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/30"
                              >
                                {s.startTime} - {s.endTime}
                              </span>
                            ))}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 opacity-40">
                    <FaCalendarAlt className="text-3xl mx-auto mb-2" />
                    <p className="text-xs">No active schedule slots available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4 pt-6 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-[var(--bg-glass)] hover:bg-[var(--bg-glass)] rounded-xl text-sm font-bold transition"
          >
            Close
          </button>
          <button
            onClick={() => !isAssigned && onAssign?.(d)}
            disabled={isAssigned}
            className={`px-6 py-2 rounded-xl text-[var(--text-main)] font-bold flex items-center gap-2 shadow-lg transition-all duration-300 ease-out transform ${
              isAssigned
                ? "bg-gray-500 cursor-not-allowed opacity-70"
                : "bg-[var(--brand-green)] hover:opacity-90 hover:-translate-y-1 hover:shadow-xl shadow-green-500/20"
            }`}
          >
            <FaUserPlus /> {isAssigned ? "Assigned" : "Assign Doctor"}
          </button>
        </div>
      </div>
    </div>
  );
}

function safeParseArray(v) {
  try {
    const parsed = typeof v === "string" ? JSON.parse(v) : v;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getAvailabilityStatus(schedules) {
  if (!schedules || schedules.length === 0)
    return { label: "No Schedule Set", color: "text-gray-400" };

  const now = new Date();
  const day = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const currentMinutes = toMinutes(currentTime);
  const daysArr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // 1. Check if available right now
  const todaySchedules = schedules.filter((s) => s.dayOfWeek === day);
  const currentSlot = todaySchedules.find((s) => {
    const start = toMinutes(s.startTime);
    const end = toMinutes(s.endTime);
    return currentMinutes >= start && currentMinutes < end;
  });

  if (currentSlot) return { label: "Available Now", color: "text-green-400" };

  // 2. Find next slot today
  const nextToday = todaySchedules
    .filter((s) => toMinutes(s.startTime) > currentMinutes)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0];

  if (nextToday)
    return { label: `Available Today @ ${nextToday.startTime}`, color: "text-blue-400" };

  // 3. Find next day with schedule
  for (let i = 1; i <= 6; i++) {
    const nextDayIdx = (day + i) % 7;
    const nextDaySchedules = schedules
      .filter((s) => s.dayOfWeek === nextDayIdx)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    if (nextDaySchedules.length > 0) {
      return {
        label: `Next: ${daysArr[nextDayIdx]} @ ${nextDaySchedules[0].startTime}`,
        color: "text-yellow-400",
      };
    }
  }

  return { label: "Fully Booked / No Slots", color: "text-red-400" };
}

export default function DoctorsList() {
  const role = "PATIENT";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";
  const patientUserId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [minExp, setMinExp] = useState("");
  const [viewDoctor, setViewDoctor] = useState(null);
  const [assignedIds, setAssignedIds] = useState(new Set());

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/patient/doctors/all", {
        params: {
          search: search || undefined,
          specialization: specialization || undefined,
          minExp: minExp || undefined,
        },
      });
      setRows(res.data?.data || res.data || []); // support both {data:[]} and []
    } catch (err) {
      console.error(err);
      toast.error("Failed to load doctors");
    } finally {
      setLoading(false);
    }
  }, [search, specialization, minExp]);

  const fetchAssignedDoctors = useCallback(async () => {
    try {
      if (!patientUserId) return;
      const res = await api.get("/patient/doctors", { params: { patientUserId } });
      // Helper: handle both simple array and object response wrappers
      const data = res.data?.data || res.data || [];
      const ids = data.map((d) => d.id);
      setAssignedIds(new Set(ids));
    } catch (err) {
      console.error("Failed to load assigned doctors", err);
    }
  }, [patientUserId]);

  useEffect(() => {
    fetchDoctors();
    fetchAssignedDoctors();
  }, [fetchDoctors, fetchAssignedDoctors]);

  const filtered = useMemo(() => rows, [rows]);

  const handleAssign = async (doc) => {
    try {
      if (!patientUserId) {
        toast.error("Error: User session invalid. Please re-login.");
        return;
      }

      const res = await api.post("/patient/doctors/assign", {
        patientUserId,
        doctorProfileId: doc.id,
      });

      if (res.data?.success || res.status === 200) {
        toast.success(`Successfully assigned Dr. ${doc.user?.lastName || "Doctor"}`);
        // Update local state immediately for UI feedback
        setAssignedIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(doc.id);
          return newSet;
        });
        // Close modal if open
        setViewDoctor(null);
        // Re-fetch to be safe
        fetchAssignedDoctors();
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to assign doctor");
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <img
              src="/images/logo/Asset3.png"
              alt="CureVirtual"
              style={{ width: 120, height: "auto" }}
              onError={(e) => {
                e.currentTarget.src = PLACEHOLDER_LOGO;
              }}
            />
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Doctors</h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                placeholder="Search name/specialization"
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] w-full sm:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <input
                placeholder="Specialization"
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] w-40"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
              />
              <input
                type="number"
                min="0"
                placeholder="Min Exp"
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)] w-28"
                value={minExp}
                onChange={(e) => setMinExp(e.target.value)}
              />
              <button
                onClick={fetchDoctors}
                className="px-4 py-2 rounded bg-[#027906] hover:bg-[#190366]"
              >
                Apply
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg overflow-x-auto">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading doctors...</p>
            ) : filtered.length === 0 ? (
              <p className="text-[var(--text-muted)]">No doctors found.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                    <th className="p-3">Name</th>
                    <th className="p-3">Specialization</th>
                    <th className="p-3">Experience</th>
                    <th className="p-3">Availability</th>
                    <th className="p-3">Fee</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const status = getAvailabilityStatus(d.schedules);
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition"
                      >
                        <td className="p-3">
                          <div className="font-semibold">
                            {d.user
                              ? `${d.user.firstName || ""} ${d.user.middleName || ""} ${d.user.lastName || ""}`.trim() ||
                                "—"
                              : "—"}
                          </div>
                          <div className="text-xs text-[var(--text-soft)]">{d.user?.email}</div>
                        </td>
                        <td className="p-3">{d.specialization || "—"}</td>
                        <td className="p-3">
                          {d.yearsOfExperience != null ? `${d.yearsOfExperience} yrs` : "—"}
                        </td>
                        <td className="p-3">
                          <span className={`${status.color} font-medium text-sm`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="p-3">
                          {d.consultationFee != null
                            ? `$${Number(d.consultationFee).toFixed(2)}`
                            : "—"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setViewDoctor(d)}
                              title="View Profile"
                              className="p-2 rounded-lg hover:bg-blue-500/10 transition"
                            >
                              <FaEye className="text-blue-400" />
                            </button>
                            <button
                              onClick={() => handleAssign(d)}
                              disabled={assignedIds.has(d.id)}
                              className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all duration-300 ease-out active:scale-95 flex items-center gap-2 shadow-sm ${
                                assignedIds.has(d.id)
                                  ? "bg-gray-500 cursor-not-allowed opacity-70"
                                  : "bg-[#027906] hover:bg-[#045d07] hover:-translate-y-1 hover:shadow-lg"
                              }`}
                            >
                              <FaUserPlus className="text-sm" />
                              {assignedIds.has(d.id) ? "Assigned" : "Assign"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <DoctorViewModal
        open={!!viewDoctor}
        doctor={viewDoctor}
        onClose={() => setViewDoctor(null)}
        onAssign={handleAssign}
        isAssigned={viewDoctor && assignedIds.has(viewDoctor.id)}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
