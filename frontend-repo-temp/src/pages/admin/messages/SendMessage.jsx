// FILE: src/pages/admin/messages/SendMessage.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import api from '../../../Lib/api';
import { FaPaperPlane, FaUserCircle, FaPen } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SendMessage() {
  const { state } = useLocation();
  const preSelectedReceiverId = state?.receiverId || '';

  const [receiverId, setReceiverId] = useState(preSelectedReceiverId);
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const senderId = localStorage.getItem('userId');
  const role = localStorage.getItem('role') || 'ADMIN';

  const user = {
    id: senderId,
    name:
      localStorage.getItem('userName') ||
      localStorage.getItem('name') ||
      'User',
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/messages/contacts/all');
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch contacts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (preSelectedReceiverId) setReceiverId(preSelectedReceiverId);
  }, [preSelectedReceiverId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!receiverId || !content.trim()) {
      toast.warn('Protocol Incomplete: Missing target or content.');
      return;
    }

    try {
      await api.post('/messages/send', { senderId, receiverId, content });
      toast.success('Packet Transmitted.');
      setContent('');
      setReceiverId('');
    } catch (err) {
      toast.error('Transmission Failed.');
    }
  };

  const groupedUsers = users.reduce((acc, u) => {
    const r = (u.role || 'OTHER').toUpperCase();
    if (!acc[r]) acc[r] = [];
    acc[r].push(u);
    return acc;
  }, {});

  const roleOrder = [
    'SUPERADMIN',
    'ADMIN',
    'SUPPORT',
    'DOCTOR',
    'PATIENT',
    'PHARMACY',
  ];

  return (
    <DashboardLayout role={role} user={user}>
      <div className="space-y-8 max-w-3xl">
        <div>
          <h2 className="text-[10px] font-black text-[var(--brand-blue)] uppercase tracking-[0.3em] mb-1">
            Uplink Terminal
          </h2>
          <h1 className="text-3xl font-black text-[var(--text-main)] tracking-tighter uppercase flex items-center gap-3">
            Initialize Message
          </h1>
        </div>

        <div className="card glass relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-focus-within:opacity-20 transition-opacity pointer-events-none">
            <FaPaperPlane size={120} />
          </div>

          <form onSubmit={handleSend} className="space-y-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--brand-blue)]">
                <FaUserCircle />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Protocol Receiver
                </span>
              </div>

              {loading ? (
                <div className="h-14 w-full bg-[var(--bg-main)]/50 rounded-2xl animate-pulse border border-[var(--border)]"></div>
              ) : (
                <select
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-2xl py-4 px-6 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-black transition-all"
                  required
                >
                  <option value="">-- Choose Interlink Subject --</option>
                  {roleOrder.map((roleName) => {
                    const list = groupedUsers[roleName];
                    if (!list || list.length === 0) return null;
                    return (
                      <optgroup
                        key={roleName}
                        label={roleName}
                        className="font-black py-2"
                      >
                        {list.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — ({u.email})
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                  {Object.keys(groupedUsers)
                    .filter((r) => !roleOrder.includes(r))
                    .map((roleName) => (
                      <optgroup key={roleName} label={roleName}>
                        {groupedUsers[roleName].map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} — ({u.email})
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-[var(--brand-blue)]">
                <FaPen />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Encoded Content
                </span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="w-full bg-[var(--bg-main)] border border-[var(--border)] rounded-3xl py-4 px-6 text-xs font-bold focus:border-[var(--brand-blue)] outline-none text-[var(--text-main)] transition-all placeholder:opacity-30"
                placeholder="Input data packets for transmission..."
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full shadow-lg shadow-[var(--brand-blue)]/20 py-4 flex items-center justify-center gap-3"
            >
              <FaPaperPlane /> Initiate Transmission
            </button>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2200} />
    </DashboardLayout>
  );
}
