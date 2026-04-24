// FILE: src/pages/admin/Subscribers.jsx
import { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import api from "../../Lib/api";
import { toast } from "react-toastify";

export default function Subscribers() {
  const role = "ADMIN";
  const adminName = localStorage.getItem("userName") || localStorage.getItem("name") || "Admin";
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(""); // filter
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/subscribers", { params: { status: status || undefined } });
      setItems(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (userId) => {
    try {
      setBusy(true);
      await api.put(`/admin/subscribers/${userId}/deactivate`);
      toast.success("User subscription deactivated");
      await load();
    } catch (err) {
      console.error(err);
      toast.error("Failed to deactivate");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[var(--bg-main)]/90 text-[var(--text-main)]">
      <Sidebar role={role} />
      <div className="flex-1 min-h-screen">
        <Topbar userName={adminName} />

        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Subscribers</h1>
            <select
              className="rounded bg-[var(--bg-glass)] border border-[var(--border)] p-2 text-[var(--text-main)]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expired</option>
              <option value="DEACTIVATED">Deactivated</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          <div className="bg-[var(--bg-glass)] backdrop-blur-md rounded-2xl p-6 shadow-lg">
            {loading ? (
              <p className="text-[var(--text-soft)]">Loading...</p>
            ) : items.length === 0 ? (
              <p className="text-[var(--text-muted)]">No subscribers found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-[var(--text-soft)] uppercase text-sm">
                      <th className="p-3">User</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Plan</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Period</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((s) => (
                      <tr key={s.id} className="border-b border-[var(--border)] hover:bg-[var(--bg-glass)] transition">
                        <td className="p-3">{s.user?.name} <span className="text-[var(--text-muted)]">({s.user?.email})</span></td>
                        <td className="p-3">{s.user?.role || "—"}</td>
                        <td className="p-3">{s.plan}</td>
                        <td className="p-3">{s.amount ? `$${(s.amount / 100).toFixed(2)}` : "—"}</td>
                        <td className="p-3">{s.computedStatus || s.status}</td>
                        <td className="p-3">
                          {s.startDate && s.endDate
                            ? `${new Date(s.startDate).toLocaleDateString()} → ${new Date(s.endDate).toLocaleDateString()}`
                            : "—"}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleDeactivate(s.userId)}
                            disabled={busy}
                            className="rounded bg-red-600 hover:bg-red-700 px-4 py-1 disabled:opacity-60"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
