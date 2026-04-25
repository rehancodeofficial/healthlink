import { useEffect, useCallback, useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import api from "../../../Lib/api";
import { Link } from "react-router-dom";
import { FaSearch, FaSync } from "react-icons/fa";
import { StatusPill, PriorityPill, TicketNo } from "../../../components/support/ui";

export default function DoctorSupportTicket() {
  const role = "DOCTOR";
  const userId = localStorage.getItem("userId") || "";
  const userName = localStorage.getItem("userName") || localStorage.getItem("name") || "Doctor";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // doctor-only tickets (raised by this doctor user)
      const res = await api.get("/support/tickets/mine", {
        params: { userId, q, status, priority },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTickets(data);
    } catch (e) {
      console.error("Failed to load doctor tickets", e);
    } finally {
      setLoading(false);
    }
  }, [userId, q, status, priority]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#027906]">My Support Tickets</h1>

            <div className="flex items-center gap-3">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search subject or ticket #"
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]"
              >
                <option value="">All Status</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="px-3 py-2 rounded bg-[var(--bg-glass)] border border-[var(--border)] text-[var(--text-main)]"
              >
                <option value="">All Priority</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <button
                onClick={fetchTickets}
                className="px-3 py-2 rounded bg-[var(--bg-glass)] hover:bg-white/20 border border-[var(--border)] text-[var(--text-main)] flex items-center gap-2"
                title="Search"
              >
                <FaSearch /> Search
              </button>
              <button
                onClick={onRefresh}
                className="px-3 py-2 rounded bg-[var(--bg-glass)] hover:bg-white/20 border border-[var(--border)] text-[var(--text-main)] flex items-center gap-2"
                title="Refresh"
                disabled={refreshing}
              >
                <FaSync className={refreshing ? "animate-spin" : ""} /> Refresh
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-[var(--text-muted)]">No tickets yet.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[#E2FCE3]">
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition">
                      <td className="p-3"><TicketNo value={t.ticketNo} /></td>
                      <td className="p-3">
                        <Link to={`/support/tickets/${t.id}`} className="underline hover:text-[#E2FCE3]">
                          {t.subject}
                        </Link>
                      </td>
                      <td className="p-3"><PriorityPill priority={t.priority} /></td>
                      <td className="p-3"><StatusPill status={t.status} /></td>
                      <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
