// FILE: src/pages/admin/messages/Inbox.jsx
import { useEffect, useState, useCallback } from 'react';
import { FaEnvelopeOpen, FaEnvelope, FaInbox } from 'react-icons/fa';
import DashboardLayout from '../../../layouts/DashboardLayout';
import api from '../../../Lib/api';

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role') || 'ADMIN';

  const user = {
    id: userId,
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'User',
  };

  const fetchInbox = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/messages/inbox/1`, {
        params: { userId, pageSize: 50 },
      });
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch inbox:', err);
    } finally {
      setLoading(false);
    }

    try {
      await api.post('/messages/mark-read', { userId, folder: 'inbox' });
      window.dispatchEvent(new CustomEvent('messages:read'));
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  return (
    <DashboardLayout role={role} user={user}>
      <div className="space-y-8">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
            Communication Hub
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-3">
            <FaInbox className="text-[var(--brand-blue)]" /> Inbox
          </h1>
        </div>

        <div className="card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--bg-main)]/50 border-b border-[var(--border)]">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Source
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Content Hub
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    Timestamp
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] text-center">
                    Protocol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] animate-pulse"
                    >
                      Syncing Secure Channels...
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-6 py-12 text-center text-sm font-bold text-[var(--text-soft)] uppercase tracking-widest text-xs"
                    >
                      Zero transmissions detected.
                    </td>
                  </tr>
                ) : (
                  messages.map((msg) => (
                    <tr
                      key={msg.id}
                      className="hover:bg-[var(--bg-main)]/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-[var(--text-main)]">
                            {msg.sender?.name || 'ENCRYPTED_ID'}
                          </span>
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            {msg.sender?.role || 'SYSTEM'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-[var(--text-soft)] leading-relaxed max-w-md">
                        {msg.content}
                      </td>
                      <td className="px-6 py-4 text-[10px] font-mono font-bold text-[var(--brand-blue)]">
                        {new Date(msg.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {msg.readAt ? (
                            <div
                              className="h-8 w-8 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20"
                              title="Read"
                            >
                              <FaEnvelopeOpen size={12} />
                            </div>
                          ) : (
                            <div
                              className="h-8 w-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20 animate-pulse"
                              title="Unread"
                            >
                              <FaEnvelope size={12} />
                            </div>
                          )}
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
    </DashboardLayout>
  );
}
