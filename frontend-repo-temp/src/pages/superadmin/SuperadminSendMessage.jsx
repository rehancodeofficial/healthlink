// FILE: src/pages/superadmin/SuperadminSendMessage.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../Lib/api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaPaperPlane,
  FaUserFriends,
  FaTerminal,
  FaBroadcastTower,
} from 'react-icons/fa';

export default function SuperadminSendMessage() {
  const [users, setUsers] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const role = localStorage.getItem('role') || 'SUPERADMIN';
  const userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('name') ||
    'Super Admin';

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const res = await api.get('/messages/contacts/all');
      const contacts = res.data?.data || [];
      setUsers(contacts);
    } catch (err) {
      toast.error('Contact Registry Error: Failed to load target users.');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!recipient) return toast.warn('Select a valid Protocol Recipient.');
    if (!message.trim()) return toast.warn('Encoded content is empty.');

    setLoading(true);
    try {
      const payload = {
        recipient,
        content: message,
        broadcast: recipient === 'ALL',
      };

      await api.post('/messages/send', payload);
      toast.success('Packet Transmitted Successfully.');
      setMessage('');
      setRecipient('');
    } catch (err) {
      toast.error('Transmission Protocol Error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role={role} user={{ name: userName }}>
      <div className="max-w-4xl space-y-10 animate-in fade-in duration-700">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-green)] uppercase tracking-[0.4em] mb-1">
            Secure Uplink
          </h2>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-4">
            <FaTerminal className="text-[var(--brand-green)]" /> Console
            Transmit
          </h1>
        </div>

        <form
          onSubmit={handleSend}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="card glass !p-10 space-y-8 border-[var(--border)] overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <FaBroadcastTower size={150} />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-1.5 font-black uppercase tracking-widest text-[var(--text-muted)] text-[10px] ml-1">
                  Target Receiver Protocol
                </div>
                <div className="relative">
                  <FaUserFriends className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <select
                    className="w-full pl-12 pr-5 py-4 bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl text-xs font-black text-black focus:border-[var(--brand-green)] outline-none transition-all shadow-sm uppercase tracking-widest"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Identity Node</option>
                    <option value="ALL">📢 Global Broadcast (All Nodes)</option>
                    {users.map((u) => (
                      <option key={`${u.type}-${u.id}`} value={u.id}>
                        {u.name} [{u.role}]
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4 relative z-10">
                <div className="space-y-1.5 font-black uppercase tracking-widest text-[var(--text-muted)] text-[10px] ml-1">
                  Encoded Content
                </div>
                <textarea
                  className="w-full p-6 bg-[var(--bg-main)] border border-[var(--border)] rounded-[2rem] text-sm font-bold text-[var(--text-main)] focus:border-[var(--brand-green)] outline-none transition-all shadow-sm min-h-[220px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Input communication parameters..."
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card !bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-main)] !p-8 border border-[var(--border)] shadow-2xl flex flex-col justify-between min-h-[300px]">
              <div>
                <h3 className="text-xl font-black text-[var(--text-main)] tracking-tighter uppercase mb-4">
                  Transmission Protocol
                </h3>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest pb-3 border-b border-[var(--border)]">
                    <span className="opacity-50">Encryption Status</span>
                    <span className="text-[var(--brand-green)] flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-[var(--brand-green)]"></div>{' '}
                      AES-256 GCM
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest pb-3 border-b border-[var(--border)]">
                    <span className="opacity-50">Node Clearance</span>
                    <span className="text-[var(--brand-blue)]">
                      LVL-4 MASTER
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full py-5 shadow-xl transition-all flex items-center justify-center gap-3 bg-[var(--brand-green)] border-[var(--brand-green)] ${
                  loading
                    ? 'opacity-50'
                    : 'hover:scale-[1.02] active:scale-95 shadow-[var(--brand-green)]/20'
                }`}
                disabled={loading}
              >
                <FaPaperPlane size={14} />{' '}
                {loading ? 'TRANSMITTING...' : 'AUTHORIZE SEND'}
              </button>
            </div>

            <div className="card glass border border-[var(--border)] !p-6 flex items-center gap-4">
              <div className="h-10 w-10 min-w-[40px] rounded-xl bg-[var(--brand-green)]/10 flex items-center justify-center text-[var(--brand-green)]">
                <FaTerminal size={12} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] leading-relaxed italic">
                Manual override for systemic broadcasts is operational. Ensure
                data veracity.
              </p>
            </div>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
