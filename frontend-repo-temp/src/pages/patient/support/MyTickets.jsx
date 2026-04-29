import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import api from "../../../Lib/api";
import {
  StatusPill,
  PriorityPill,
  TicketNo,
  Modal,
  ConfirmModal,
} from "../../../components/support/ui";
import { FaPlusCircle, FaSearch, FaSync, FaTrashAlt } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyTickets() {
  const role = "PATIENT";
  const userId = localStorage.getItem("userId") || "";
  const userName =
    localStorage.getItem("userName") || localStorage.getItem("name") || "Patient";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  // create modal
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    body: "",
    priority: "MEDIUM",
  });
  const [creating, setCreating] = useState(false);

  // delete confirm
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchTickets = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await api.get("/support/tickets/mine", {
        params: { userId, q, status, priority },
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setTickets(data);
    } catch (err) {
      console.error("Failed to load my tickets:", err);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [userId, q, status, priority]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
    setRefreshing(false);
  };

  const openDelete = (id) => {
    setDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/support/tickets/${deleteId}`);
      setTickets((prev) => prev.filter((t) => t.id !== deleteId));
      toast.success("Ticket deleted");
    } catch (err) {
      console.error("Delete ticket failed:", err);
      toast.error("Failed to delete ticket");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  const createTicket = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.body.trim()) {
      toast.warn("Please fill subject and message");
      return;
    }
    try {
      setCreating(true);
      await api.post("/support/tickets", {
        userId, // raisedBy
        subject: form.subject,
        body: form.body,
        priority: form.priority,
      });
      toast.success("Ticket created");
      setOpenCreate(false);
      setForm({ subject: "", body: "", priority: "MEDIUM" });
      await fetchTickets();
    } catch (err) {
      console.error("Create ticket failed:", err);
      toast.error(err?.response?.data?.error || "Failed to create ticket");
    } finally {
      setCreating(false);
    }
  };

  const filters = useMemo(() => (
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
  ), [q, status, priority, refreshing, fetchTickets]);

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={userName} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-[#027906]">My Support Tickets</h1>
            <div className="flex items-center gap-3">
              {filters}
              <button
                onClick={() => setOpenCreate(true)}
                className="ml-3 flex items-center gap-2 bg-[#027906] hover:bg-[#045d07] text-[var(--text-main)] px-4 py-2 rounded-md transition"
              >
                <FaPlusCircle /> New Ticket
              </button>
            </div>
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading tickets...</p>
            ) : tickets.length === 0 ? (
              <p className="text-[var(--text-muted)]">No tickets yet. Create your first ticket.</p>
            ) : (
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] text-[#E2FCE3]">
                    <th className="p-3">Ticket</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Priority</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition">
                      <td className="p-3"><TicketNo value={t.ticketNo} /></td>
                      <td className="p-3">
                        <button
                          className="underline hover:text-[#E2FCE3]"
                          onClick={() => navigate(`/patient/support/tickets/${t.id}`)}
                        >
                          {t.subject}
                        </button>
                      </td>
                      <td className="p-3"><PriorityPill priority={t.priority} /></td>
                      <td className="p-3"><StatusPill status={t.status} /></td>
                      <td className="p-3">{new Date(t.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => openDelete(t.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-600/80 hover:bg-red-700"
                          title="Delete"
                        >
                          <FaTrashAlt /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Create Ticket Modal */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Create Support Ticket">
        <form onSubmit={createTicket} className="space-y-4">
          <div>
            <label className="block mb-1 text-[var(--text-soft)]">Subject</label>
            <input
              className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={form.subject}
              onChange={(e) => setForm((s) => ({ ...s, subject: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-[var(--text-soft)]">Priority</label>
            <select
              className="w-full rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={form.priority}
              onChange={(e) => setForm((s) => ({ ...s, priority: e.target.value }))}
            >
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 text-[var(--text-soft)]">Message</label>
            <textarea
              className="w-full h-32 rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={form.body}
              onChange={(e) => setForm((s) => ({ ...s, body: e.target.value }))}
              required
            />
          </div>

          <button
            type="submit"
            disabled={creating}
            className="w-full rounded bg-[#027906] hover:bg-[#045d07] py-2 text-[var(--text-main)] font-semibold transition disabled:opacity-60"
          >
            {creating ? "Creating..." : "Create Ticket"}
          </button>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={confirmOpen}
        title="Delete Ticket?"
        message="This will permanently delete the ticket and its replies."
        confirmText="Delete"
        cancelText="Keep"
        onConfirm={doDelete}
        onCancel={() => setConfirmOpen(false)}
        loading={deleting}
      />

      <ToastContainer position="top-right" autoClose={2200} />
    </div>
  );
}
