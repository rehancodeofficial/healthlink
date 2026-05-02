// FILE: src/pages/support/SupportTickets.jsx
import { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import {
  FaSearch,
  FaTrashAlt,
  FaPlusCircle,
  FaTicketAlt,
  FaFilter,
  FaReply,
  FaUserShield,
  FaExclamationCircle,
} from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SupportTickets() {
  const role = 'SUPPORT';
  const supportUserId = localStorage.getItem('userId') || '';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Support';

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets', {
        params: { q: query || undefined },
      });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTickets(list);
    } catch (e) {
      toast.error('Transmission Error: Failed to sync ticket registry.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!selected) {
        setDetail(null);
        setReplyText('');
        return;
      }
      try {
        setDetailLoading(true);
        const res = await api.get(`/support/tickets/${selected.id}`);
        setDetail(res.data?.data || res.data || null);
      } catch (e) {
        toast.error('Registry Failure: Could not load packet details.');
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [selected]);

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Authorize Purge: Irreversible deletion of communication artifact?'
      )
    )
      return;
    try {
      await api.delete(`/support/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
      toast.info('Ticket Purged Successfully.');
      if (selected?.id === id) setSelected(null);
    } catch (e) {
      toast.error('Purge Protocol Failed.');
    }
  };

  const sendReply = async (e) => {
    e.preventDefault();
    if (!detail?.id || !replyText.trim()) return;
    try {
      setReplying(true);
      const res = await api.post(`/support/tickets/${detail.id}/replies`, {
        userId: supportUserId,
        message: replyText.trim(),
      });
      const created = res.data?.data || res.data;
      setDetail((prev) =>
        prev ? { ...prev, replies: [...(prev.replies || []), created] } : prev
      );
      setReplyText('');
      toast.success('Response Transmitted.');
    } catch (e) {
      toast.error('Uplink Failure.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-orange)] uppercase tracking-[0.4em] mb-1">
              Issue Tracking
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaTicketAlt className="text-[var(--brand-orange)]" /> Resolution
              Hub
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search Subject / ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full sm:w-64 pl-12 pr-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] focus:border-[var(--brand-orange)] outline-none"
              />
            </div>
            <button className="btn btn-primary !bg-[var(--brand-orange)] !border-[var(--brand-orange)] flex items-center gap-2 px-6">
              <FaPlusCircle /> Initialize Ticket
            </button>
          </div>
        </div>

        <div className="card !p-0 overflow-hidden border border-[var(--border)] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Matrix ID
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Subject Matter
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Priority
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Origin
                  </th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Protocol Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse uppercase tracking-[0.2em]"
                    >
                      Syncing Resolution Database...
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-8 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-[0.2em]"
                    >
                      No Tickets Found.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-[var(--bg-glass)] transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <span className="text-[10px] font-black px-3 py-1 bg-[var(--bg-glass)] border border-[var(--border)] rounded-full text-[var(--text-muted)] tracking-widest uppercase">
                          {t.ticketNo || 'VOID'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <button
                          onClick={() => setSelected(t)}
                          className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight hover:text-[var(--brand-orange)] transition-colors text-left"
                        >
                          {t.subject}
                        </button>
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              t.status === 'OPEN'
                                ? 'bg-red-500'
                                : t.status === 'RESOLVED'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                          ></div>
                          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            {t.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            t.priority === 'HIGH'
                              ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                              : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-[10px] font-bold text-[var(--text-soft)] group-hover:text-[var(--text-main)] transition-colors">
                        {t.user?.name || 'System'}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => setSelected(t)}
                            className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaReply size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-[var(--text-main)] transition-all shadow-sm"
                          >
                            <FaTrashAlt size={14} />
                          </button>
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

      {/* Detail Overlay */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--bg-main)]/90 backdrop-blur-md"
            onClick={() => setSelected(null)}
          ></div>
          <div className="relative w-full max-w-4xl glass !p-0 overflow-hidden animate-in zoom-in-95 duration-300 rounded-[2.5rem]">
            <div className="p-8 border-b border-[var(--border)] bg-[var(--bg-glass)] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-[var(--brand-orange)]/10 flex items-center justify-center text-[var(--brand-orange)] shadow-inner">
                  <FaUserShield size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase">
                    {detail?.subject || selected.subject}
                  </h3>
                  <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                    Ticket:{' '}
                    <span className="text-[var(--brand-orange)]">
                      {detail?.ticketNo}
                    </span>{' '}
                    • {detail?.user?.name || 'Anonymous Subject'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="h-10 w-10 rounded-full hover:bg-[var(--bg-glass)] flex items-center justify-center text-[var(--text-muted)] transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
              <div className="lg:col-span-2 p-8 max-h-[60vh] overflow-y-auto space-y-8 scrollbar-hide">
                <div className="card !bg-[var(--bg-main)]/50 !p-6 border border-[var(--border)]">
                  <p className="text-xs font-bold text-[var(--text-main)] leading-relaxed whitespace-pre-wrap">
                    {detail?.body || 'Protocol Body Empty.'}
                  </p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
                    <FaReply /> System Communication History
                  </h4>
                  <div className="space-y-4">
                    {(detail?.replies || []).map((r) => (
                      <div
                        key={r.id}
                        className={`p-5 rounded-2xl border ${
                          r.user?.role === 'SUPPORT'
                            ? 'bg-[var(--brand-blue)]/5 border-[var(--brand-blue)]/10 ml-10'
                            : 'bg-white/5 border-white/10 mr-10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            {r.user?.name || 'Authorized Person'}
                          </span>
                          <span className="text-[8px] font-bold text-[var(--text-soft)]">
                            {new Date(r.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-soft)]">
                          {r.message}
                        </p>
                      </div>
                    ))}
                    {(detail?.replies || []).length === 0 && (
                      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center py-10 italic">
                        Registry Silent.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/2 space-y-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Transmit Response
                  </h4>
                  <textarea
                    className="w-full p-5 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl text-xs font-bold text-[var(--text-main)] outline-none focus:border-[var(--brand-orange)] transition-all min-h-[150px]"
                    placeholder="Input communication parameters..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={replying}
                  />
                  <button
                    onClick={sendReply}
                    disabled={replying || !replyText.trim()}
                    className="btn btn-primary w-full py-4 !bg-[var(--brand-orange)] !border-[var(--brand-orange)] shadow-lg shadow-orange-500/20 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                  >
                    {replying ? 'Transmitting...' : 'Authorize Reply'}
                  </button>
                </div>

                <div className="card glass !p-5 border border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-4">
                    <FaExclamationCircle className="text-[var(--brand-orange)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-main)]">
                      Operational Alert
                    </span>
                  </div>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-relaxed">
                    Ensure response parameters adhere to protocol standards. All
                    sessions are logged for audit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
