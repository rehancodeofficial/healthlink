// FILE: src/pages/doctor/DoctorSchedule.jsx
import React, { useState, useEffect } from "react";
import api from "../../Lib/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { toast } from "react-toastify";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DoctorSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const doctorId = localStorage.getItem("userId");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/schedule?doctorId=${doctorId}`);
      setSchedules(res.data.data || []);
    } catch (err) {
      console.error("Error fetching schedules:", err);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dayOfWeek || !formData.startTime || !formData.endTime) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      if (editingId) {
        // Update existing schedule
        await api.patch(`/schedule/${editingId}`, formData);
        toast.success("Schedule updated successfully!");
      } else {
        // Create new schedule
        await api.post("/schedule", {
          ...formData,
          doctorId,
        });
        toast.success("Schedule created successfully!");
      }

      setFormData({ dayOfWeek: "", startTime: "", endTime: "", isActive: true });
      setEditingId(null);
      fetchSchedules();
    } catch (err) {
      console.error("Error saving schedule:", err);
      toast.error(err.response?.data?.error || "Failed to save schedule");
    }
  };

  const handleEdit = (schedule) => {
    setFormData({
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      isActive: schedule.isActive,
    });
    setEditingId(schedule.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await api.delete(`/schedule/${id}`);
      toast.success("Schedule deleted successfully!");
      fetchSchedules();
    } catch (err) {
      console.error("Error deleting schedule:", err);
      toast.error("Failed to delete schedule");
    }
  };

  const toggleActive = async (schedule) => {
    try {
      await api.patch(`/schedule/${schedule.id}`, {
        isActive: !schedule.isActive,
      });
      toast.success(`Schedule ${!schedule.isActive ? "activated" : "deactivated"}`);
      fetchSchedules();
    } catch (err) {
      console.error("Error toggling schedule:", err);
      toast.error("Failed to update schedule");
    }
  };

  const cancelEdit = () => {
    setFormData({ dayOfWeek: "", startTime: "", endTime: "", isActive: true });
    setEditingId(null);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <Sidebar role="DOCTOR" />
      <div className="flex-1 flex flex-col">
        <Topbar userName={userName} />

        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold text-[var(--text-main)] mb-6 tracking-wide">
            My Schedule
          </h1>

          {/* Add/Edit Schedule Form */}
          <div className="max-w-4xl mx-auto bg-[var(--bg-glass)] p-6 rounded-xl shadow-lg border border-[var(--border)] mb-6">
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">
              {editingId ? "Edit Schedule" : "Add Availability"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block font-medium mb-2 text-[var(--text-soft)]">Day</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                  className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Day</option>
                  {DAYS.map((day, idx) => (
                    <option key={idx} value={idx} className="bg-[var(--bg-card)]">
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2 text-[var(--text-soft)]">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-2 text-[var(--text-soft)]">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full bg-transparent border border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex-1 bg-green-700 hover:bg-green-300 text-[var(--text-main)] py-3 rounded-lg font-semibold transition"
              >
                {editingId ? "Update" : "Add"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-[var(--text-main)] rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
              )}
            </form>
          </div>

          {/* Schedule List */}
          <div className="max-w-6xl mx-auto bg-[var(--bg-glass)] p-6 rounded-xl shadow-lg border border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">Current Schedule</h2>

            {loading ? (
              <p className="text-[var(--text-muted)]">Loading schedules...</p>
            ) : schedules.length === 0 ? (
              <p className="text-[var(--text-muted)]">
                No schedules set. Add your availability above to allow patients to book
                appointments.
              </p>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                    <th className="p-3 text-left w-16">⋮</th>
                    <th className="p-3 text-left">Day</th>
                    <th className="p-3 text-left">Start Time</th>
                    <th className="p-3 text-left">End Time</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {schedules.map((schedule) => (
                    <tr
                      key={schedule.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition"
                    >
                      <td className="p-3">
                        <select
                          onChange={(e) => {
                            const action = e.target.value;
                            if (action === "edit") {
                              handleEdit(schedule);
                            } else if (action === "toggle") {
                              toggleActive(schedule);
                            } else if (action === "delete") {
                              handleDelete(schedule.id);
                            }
                            e.target.value = ""; // Reset dropdown
                          }}
                          className="bg-transparent border-0 text-lg text-[var(--text-main)] cursor-pointer focus:outline-none hover:text-blue-500"
                        >
                          <option value="">⋮</option>
                          <option value="edit">✏️ Edit</option>
                          <option value="toggle">
                            {schedule.isActive ? "⏸️ Deactivate" : "▶️ Activate"}
                          </option>
                          <option value="delete">🗑️ Delete</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <span className="font-semibold">{DAYS[schedule.dayOfWeek]}</span>
                      </td>
                      <td className="p-3">{schedule.startTime}</td>
                      <td className="p-3">{schedule.endTime}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            schedule.isActive
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {schedule.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Weekly Overview */}
          <div className="max-w-6xl mx-auto mt-6 bg-[var(--bg-glass)] p-6 rounded-xl shadow-lg border border-[var(--border)]">
            <h2 className="text-xl font-semibold text-[var(--text-main)] mb-4">Weekly Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
              {DAYS.map((day, idx) => {
                const daySchedules = schedules.filter((s) => s.dayOfWeek === idx && s.isActive);
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      daySchedules.length > 0
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-gray-500/10 border-gray-500/30"
                    }`}
                  >
                    <h3 className="font-semibold text-center mb-2">{day}</h3>
                    {daySchedules.length > 0 ? (
                      <div className="text-xs space-y-1">
                        {daySchedules.map((s) => (
                          <div key={s.id} className="text-center text-[var(--text-soft)]">
                            {s.startTime} - {s.endTime}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-center text-gray-500">No availability</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedule;
