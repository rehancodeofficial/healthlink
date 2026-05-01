// FILE: src/pages/superadmin/SuperadminInbox.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaTrash,
  FaEnvelopeOpen,
  FaEnvelope,
  FaHistory,
  FaUserSecret,
} from 'react-icons/fa';

export default function SuperadminInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const role = localStorage.getItem('role') || 'SUPERADMIN';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Super Admin';

  useEffect(() => {
    loadMessages();
  }, [page]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const res = await api.get('/messages/inbox', {
        params: { page },
      });
      setMessages(res.data?.data || []);
      setTotal(res.data?.total || 0);
    } catch (err) {
      toast.error(
        'Decryption Registry Failure: Could not load communication packets.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        'Authorize Protocol: Purge this transmission permanently?'
      )
    )
      return;
    try {
      await api.delete(`/messages/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      toast.info('Transmission Purged.');
    } catch (err) {
      toast.error('Purge Protocol Failure.');
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.4em] mb-1">
              Secure Comms Hub
            </h2>
            <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
              <FaEnvelope className="text-[var(--brand-green)]" /> Protocol
              Inbox
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-[var(--bg-card)] px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm">
            <FaHistory className="text-[var(--brand-green)] animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-soft)]">
              {total} Packets Received
            </span>
          </div>
        </div>

        {loading && messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="h-12 w-12 border-4 border-[var(--brand-green)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Syncing Uplink...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="card glass flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-[2rem] bg-[var(--bg-glass)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] mb-6">
              <FaEnvelope size={30} />
            </div>
            <h3 className="text-xl font-black text-[var(--text-main)] tracking-tight uppercase">
              Void Transmission
            </h3>
            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">
              Registry is currently silent.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {messages.map((msg) => {
              const senderName =
                msg.sender?.name ||
                (msg.adminSenderId ? 'System Intel' : 'Unknown Identity');
              const senderRole =
                msg.sender?.role || (msg.adminSenderId ? 'ADMIN' : 'EXT');

              return (
                <div
                  key={msg.id}
                  className={`card glass group relative overflow-hidden transition-all hover:bg-[var(--bg-card)] border-l-4 ${
                    msg.readAt
                      ? 'border-[var(--border)] opacity-80'
                      : 'border-[var(--brand-green)]'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-5">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg ${
                          msg.readAt
                            ? 'bg-white/5 text-[var(--text-muted)]'
                            : 'bg-[var(--brand-green)]/20 text-[var(--brand-green)]'
                        }`}
                      >
                        {msg.readAt ? (
                          <FaEnvelopeOpen size={18} />
                        ) : (
                          <FaEnvelope size={18} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-black text-[var(--text-main)] uppercase tracking-tight">
                            {senderName}
                          </span>
                          <span className="text-[8px] px-2 py-0.5 rounded-full bg-[var(--bg-glass)] border border-[var(--border)] font-black text-[var(--text-muted)] tracking-widest">
                            {senderRole}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-[var(--text-soft)] leading-relaxed max-w-3xl">
                          {msg.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-6 pl-12 md:pl-0">
                      <div className="text-right">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                          {formatDate(msg.createdAt)}
                        </p>
                        <p className="text-[8px] font-bold text-[var(--brand-green)] uppercase tracking-[0.2em]">
                          {msg.readAt ? 'Verified' : 'Pending'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(msg.id)}
                        className="p-3 rounded-xl bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-[var(--text-main)]"
                        title="Purge transmission"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {total > 20 && (
          <div className="flex justify-center items-center gap-6 pt-10">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="btn glass px-6 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
            >
              Prev Segment
            </button>
            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
              Node <span className="text-[var(--text-main)]">{page}</span> /{' '}
              {Math.ceil(total / 20)}
            </div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="btn glass px-6 py-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-20"
            >
              Next Segment
            </button>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
