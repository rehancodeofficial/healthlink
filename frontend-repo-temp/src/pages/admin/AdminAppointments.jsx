// FILE: src/pages/Admin/AdminAppointments.jsx
import { useEffect, useState, useCallback } from "react";
import api from "../../Lib/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { FaCheckCircle, FaTimesCircle, FaTrash, FaClock } from "react-icons/fa";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userName = localStorage.getItem("userName");
  const role = localStorage.getItem("role");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/appointments");
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      setError("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatus = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      console.error("Error updating appointment:", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;
    try {
      await api.delete(`/admin/appointments/${id}`);
      fetchAppointments();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      alert("Failed to delete appointment");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-600 text-white";
      case "PENDING":
        return "bg-yellow-400 text-black";
      case "COMPLETED":
        return "bg-blue-600 text-white";
      case "CANCELLED":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="flex bg-[#000000]/90 text-[var(--text-main)] min-h-screen">
      <Sidebar role={role} />
      <div className="flex-1 p-6">
        <Topbar userName={userName} />
        <h1 className="text-3xl font-bold mb-6">Appointments Management</h1>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        {loading ? (
          <p>Loading appointments...</p>
        ) : (
          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="p-3">Doctor</th>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition"
                  >
                    <td className="p-3">{a.doctor?.user?.name || "N/A"}</td>
                    <td className="p-3">{a.patient?.user?.name || "N/A"}</td>
                    <td className="p-3">
                      {new Date(a.appointmentDate).toLocaleString()}
                    </td>
                    <td className="p-3">{a.reason || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="p-3 flex gap-3">
                      <button
                        onClick={() => handleStatus(a.id, "APPROVED")}
                        className="hover:scale-110 transition"
                        title="Approve"
                      >
                        <FaCheckCircle className="text-green-400" />
                      </button>
                      <button
                        onClick={() => handleStatus(a.id, "CANCELLED")}
                        className="hover:scale-110 transition"
                        title="Cancel"
                      >
                        <FaTimesCircle className="text-red-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="hover:scale-110 transition"
                        title="Delete"
                      >
                        <FaTrash className="text-[var(--text-soft)]" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {appointments.length === 0 && (
              <p className="text-center text-[var(--text-muted)] mt-6">
                No appointments found.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
