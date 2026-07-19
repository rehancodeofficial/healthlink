// FILE: src/pages/shared/SubscribersList.jsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaEye,
  FaSearch,
  FaFilter,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

export default function SubscribersList({
  title = 'Subscribers',
  role = 'ADMIN',
  filterRole = 'DOCTOR',
  initialPlan = '',
}) {
  const userName =
    localStorage.getItem('userName') || localStorage.getItem('name') || role;

  const [q, setQ] = useState('');
  const [plan, setPlan] = useState(initialPlan);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(total / pageSize)),
    [total, pageSize]
  );

  const [view, setView] = useState(null);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setErr('');
      const res = await api.get('/subscribers/list', {
        params: {
          role: filterRole || undefined,
          plan: plan || undefined,
          status: status || undefined,
          q: q || undefined,
          page,
          pageSize,
        },
      });
      const data = res.data?.data || {};
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      setErr('Failed to load clinical subscription registry.');
    } finally {
      setLoading(false);
    }
  }, [filterRole, plan, status, q, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [plan, status, q]);
  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (subscriptionId, next) => {
    try {
      await api.patch(`/subscribers/subscription/${subscriptionId}/status`, {
        status: next,
      });
      load();
    } catch (e) {
      setErr('Failed to update protocol status.');
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
              Subscription Management
            </h2>
            <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase">
              {title}
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative group">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-blue)] transition-all" />
              <input
                type="text"
                placeholder="Identity Search..."
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 pl-12 pr-6 text-xs font-bold focus:border-[var(--brand-blue)] outline-none"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none"
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
            >
              <option value="">All Tiers</option>
              <option value="MONTHLY">Monthly Billing</option>
              <option value="YEARLY">Yearly Billing</option>
            </select>
            <select
              className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-3 px-4 text-xs font-bold focus:border-[var(--brand-blue)] outline-none"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">System Active</option>
              <option value="EXPIRED">Terminated</option>
              <option value="DEACTIVATED">Suspended</option>
              <option value="PENDING">Pending Auth</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => load()}
                className="btn btn-secondary !py-3 !px-4 !text-[10px] flex-1"
              >
                Apply Protocol
              </button>
              <button
                onClick={() => {
                  setQ('');
                  setPlan('');
                  setStatus('');
                  setPage(1);
                }}
                className="btn btn-glass !py-3 !px-4 !text-[10px]"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {err && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">
              {err}
            </p>
          </div>
        )}

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Subject
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Encrypted Hub
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    System Role
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Billing Plan
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Protocol Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Operations
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse"
                    >
                      Syncing Subscriber DB...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      No subscribers found in registry.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => {
                    const sub = it.sub;
                    const canSuspend = sub && sub.status === 'ACTIVE';
                    const canActivate =
                      sub &&
                      (sub.status === 'DEACTIVATED' ||
                        sub.status === 'EXPIRED');
                    return (
                      <tr
                        key={it.id}
                        className="hover:bg-[var(--bg-main)]/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-black text-[var(--text-main)]">
                          {it.name}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)]">
                          {it.email}
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full bg-[var(--bg-main)]/50 border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
                            {it.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-mono font-bold text-[var(--brand-blue)]">
                          {sub?.plan || '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                              sub?.status === 'ACTIVE'
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                                : sub?.status === 'DEACTIVATED'
                                ? 'bg-red-500/20 text-red-500 border border-red-500/30'
                                : 'bg-orange-500/20 text-orange-500 border border-orange-500/30'
                            }`}
                          >
                            {sub?.status || 'NO_SUB'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              title="Inspect Identity"
                              className="p-2 rounded-xl bg-[var(--brand-blue)]/10 text-[var(--brand-blue)] hover:bg-[var(--brand-blue)] hover:text-[var(--text-main)] transition-all shadow-sm"
                              onClick={() => setView(it)}
                            >
                              <FaEye size={14} />
                            </button>
                            {canSuspend && (
                              <button
                                className="btn !py-1.5 !px-3 !text-[9px] bg-red-600 !rounded-xl"
                                onClick={() =>
                                  toggleStatus(sub.id, 'DEACTIVATED')
                                }
                              >
                                Suspend
                              </button>
                            )}
                            {canActivate && (
                              <button
                                className="btn !py-1.5 !px-3 !text-[9px] bg-[var(--brand-green)] !rounded-xl"
                                onClick={() => toggleStatus(sub.id, 'ACTIVE')}
                              >
                                Restore
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="bg-[var(--bg-main)]/50 px-6 py-4 border-t border-[var(--border)] flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Protocol Page {page} / {totalPages} — Total Subjects: {total}
            </p>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-20 hover:text-[var(--text-main)] transition-all"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <FaArrowLeft size={12} />
              </button>
              <button
                className="p-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-20 hover:text-[var(--text-main)] transition-all"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {view && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
           onClick={() => setView(null)}
          ></div>
          <div className="relative w-full max-w-lg glass !p-8 animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-6 flex items-center gap-3">
              Subscriber Identity
            </h2>
            <div className="space-y-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Legal Name
                  </p>
                  <p className="text-sm font-bold text-[var(--text-main)]">
                    {view.name}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    System Role
                  </p>
                  <p className="text-sm font-bold text-[var(--brand-green)]">
                    {view.role}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                  Email Identity
                </p>
                <p className="text-sm font-black text-[var(--text-main)]">
                  {view.email}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Service Tier
                  </p>
                  <p className="text-sm font-black text-[var(--brand-blue)]">
                    {view.sub?.plan || 'NONE'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-widest">
                    Protocol Status
                  </p>
                  <p className="text-sm font-black text-[var(--text-main)]">
                    {view.sub?.status || 'OFFLINE'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setView(null)}
              className="btn btn-primary w-full shadow-lg"
            >
              Close Vault
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
